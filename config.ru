# thin start -p PORT -R config.ru
# thin -p 4567 -D -R config.ru start
# thin -p 8080 -d -R config.ru start

gem 'thin'#, '= 1.3.1'
#gem 'em-websocket', '< 0.4.0'
require 'thin'

begin
  require 'sinatra/reloader' unless ENV['RACK_ENV'] == 'production'
rescue LoadError => e
  puts e.message
end

require './git_tasks.rb'
map '/' do
  run GitTasks::App.new() #(:userfile => './users.yml')
end

