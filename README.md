# git-tasks

Have a SCRUM/KANBAN like task board, based on plain text files, directly in your git repository.


![screenshot](https://github.com/pachacamac/git-tasks/blob/master/screenshot.png?raw=true)

# Idea

Once upon a time I thought it would be an amazing idea to put your task board under version control. Not just any version control though but the very same one that is used for your project. I'm still not 100% sure if it's a good idea or not but before I thought about it too much I just built it and used it here and there. On one hand it's awesome to have everything under the same version control, on the other hand it might create commit-chaos when used excessively? I kind of like the option to just use the command line to move and edit tasks when I don't feel like opening the web-interface though.

Feedback welcome! Let me know what your thoughts are.


# Installation / usage

1. clone repo
2. bundle install
3. rackup
4. go to http://localhost:9292
5. amaze!

Oh and the repo should have a folder called `tasks`. In there should be a few folders like this: `10-todo`, `20-in_progress`, `30-done` etc.


# Warning
* Be sure to have the [ruby-devel] headers installed:  
Red Hat, Fedora:  
```
  yum -y install gcc ruby-devel rubygems
```
Debian, Ubuntu:  
```
  apt-get install ruby-dev
```
* This is older code that I haven't touched in a while and therefore needs cleanup!
* There are definitely bugs in there. Use at own risk.
* Feel free to open issues
* Pull requests welcome!
