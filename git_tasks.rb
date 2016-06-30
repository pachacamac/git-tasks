# encoding: UTF-8
require 'sinatra/base'
require 'haml'
require 'fileutils'
require 'digest/md5'

module GitTasks
  BASE_PATH = '/tmp/git-tasks'
  GIT_TASKS_DIR = 'tasks'

  class Task
    attr_accessor :filename, :body, :headers
    def initialize(filename, body='', headers={}); @filename, @body, @headers = filename.tr('..',''), body, headers; end
    def name; File.basename(filename).split('-', 2).last rescue ''; end
    def id; File.basename(filename).split('-').first rescue ''; end
    def save!
      return unless filename.start_with?(BASE_PATH)
      File.write(filename, [headers.map{|e| e.join(': ')}.join("\n"), body].join("\n\n"))
    end
    def self.from_file(f) # read headers and body and convert headers to a hash
      f.tr!('..','')
      return unless f.start_with?(BASE_PATH)
      lines = File.read(f).lines.to_a
      headers = {}
      headers[$1.tr('-','_').to_sym] = $2.strip while (l=lines.shift) =~ /\A(\w[\w\s\-]+): +(.*?)\Z/ # headers
      body = ([l]+lines).join.strip
      new(f, body, headers)
    end
  end

  class << self
    def read_board(folder)
      folder.tr!('..','')
      Hash[
        Dir[File.join(folder, '*')].select{|e|
          File.directory?(e) && File.basename(e).match(/\A\d+\-\w+\Z/)
        }.sort.map{|e|
          [e, {
            name:   File.basename(e).split('-', 2).last.gsub(/_/, ' ').capitalize,
            tasks:  Dir[File.join(e, '*')].select{|f| File.file?(f)}.map{|f| Task.from_file(f)}.sort_by{|t| t.headers[:priority]}.reverse
          }]
      }]
    end

    def next_task_number(board)
      (board.reduce([0]){|numbers, (folder, lane)|
        numbers += lane[:tasks].map{|e| File.basename(e.filename).split('-', 2).first.to_i}
      }.max + 1).to_s.rjust(3,'0')
    end

    def git_fetch(repo, shallow=false) # shallow let's you commit and push only in newer git versions
      folder = Digest::MD5.hexdigest(repo) #repo is the git-url
      full_path = File.join(BASE_PATH, folder)
      if File.exist?(full_path)
        Dir.chdir(full_path){ system("git pull")}
      else
        FileUtils.mkdir_p(BASE_PATH)
        system("git clone #{shallow ? '--depth 1' : ''} '#{repo}' '#{full_path}'")
      end ? full_path : nil
    end

    def git_add_commit_push(folder, message)
      Dir.chdir(folder){ system("git add -A && git commit -m '#{message}' && git push") }
    end
  end

  class App < Sinatra::Base
    register Sinatra::Reloader if Sinatra.const_defined? 'Reloader'
    enable :sessions, :logging
    set :root, File.dirname(__FILE__)
    set :public_folder, 'public'

    def initialize(opts={})
      super()
      #@userfile = opts[:userfile] || "#{File.absolute_path(File.dirname(__FILE__))}/user.yml"
    end

    def in_repo(repo, &block)
      if repo_path = GitTasks.git_fetch(repo)
        board = GitTasks.read_board(File.join(repo_path, GIT_TASKS_DIR))
        yield repo_path, board
      else
        status 403
        'Repository could not be fetched'
      end
    end

    get '/' do
      haml :index
    end

    post '/repo/*/move_task/?' do |repo|
      task, from, to = params[:task], params[:from], params[:to]
      in_repo(repo) do |repo_path, board|
        if board[from][:tasks].find{|e| e.filename == task} && board[to]
          FileUtils.move(task, to)
          GitTasks.git_add_commit_push(repo_path, "Moved task #{File.basename(task)} from #{File.basename(from)} to #{File.basename(to)}")
          haml :task, {layout: false}, {task: Task.from_file(File.join(to, File.basename(task)))}
        else
          status 404
          'Task or lane not found'
        end
      end
    end

    get '/repo/*/new_task/?' do |repo|
      haml :task_modal, {layout: false}, {task: Task.new('', '', {priority: 1, points: 1, type: 'task'})}
    end

    get '/repo/*/edit_task/?' do |repo|
      haml :task_modal, {layout: false}, {task: Task.from_file(params[:task])}
    end

    post '/repo/*/create_task/?' do |repo|
      name, headers, body, lane = params[:name], params[:headers], params[:body], params[:lane]
      in_repo(repo) do |repo_path, board|
        lane = board[lane] ? lane : board.first.first
        number = GitTasks.next_task_number(board)
        name = "#{name}".gsub(/[^äöüÄÖÜß\w]+/,'_')
        name = name.empty? ? "#{number}" : "#{number}-#{name}"
        task = Task.new(File.join(lane, name), body, headers)
        task.save!
        GitTasks.git_add_commit_push(repo_path, "Created new task #{task.id}-#{task.name} in lane #{lane}")
        haml :task, {layout: false}, {task: task}
      end
    end

    post '/repo/*/update_task/?' do |repo|
      task_path, name, headers, body = params[:task], params[:name], params[:headers], params[:body]
      in_repo(repo) do |repo_path, board|
        task = Task.from_file(task_path)
        task.body = body
        task.headers = headers
        extra = ''
        if task.name != name
          extra = " was #{task.id}-#{task.name}"
          task.filename = File.join(File.dirname(task_path), [task.id, name].join('-'))
          File.delete(task_path)
        end
        task.save!
        GitTasks.git_add_commit_push(repo_path, "Updated task #{task.id}-#{task.name}#{extra}")
        haml :task, {layout: false}, {task: task}
      end
    end

    post '/repo/*/delete_task/?' do |repo|
      task = params[:task]
      in_repo(repo) do |repo_path, board|
        if board.find{|k,v| v[:tasks].find{|e| e.filename == task}}
          File.delete(task)
          GitTasks.git_add_commit_push(repo_path, "Deleted task #{File.basename(task)}")
        else
          status 404
          'Task not found'
        end
      end
    end

    get '/repo/*/?' do |repo|
      in_repo(repo) do |repo_path, board|
        haml :board, {}, {lanes: board, repo: repo}
      end
    end

  end

end
