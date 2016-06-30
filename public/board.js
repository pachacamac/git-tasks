/************************
        Libraries
*************************/
/* tinyMD (https://gist.github.com/pachacamac/e3a8dbb2100ee5d16dae) based on micromarkdown.js - https://github.com/SimonWaldherr/micromarkdown.js */
var tinyMd={regexobject:{headline:/^(\#{1,6})([^\#\n]+)$/m,code:/\s\`\`\`\n?([^`]+)\`\`\`/g,hr:/^(?:([\*\-_] ?)+)\1\1$/gm,lists:/^((\s*((\*|\-)|\d(\.|\))) [^\n]+)\n)+/gm,bolditalic:/(?:([\*_~]{1,3}))([^\*_~\n]+[^\*_~\s])\1/g,links:/!?\[([^\]<>]+)\]\(([^ \)<>]+)( "[^\(\)\"]+")?\)/g,reflinks:/\[([^\]]+)\]\[([^\]]+)\]/g,mail:/<(([a-z0-9_\-\.])+\@([a-z0-9_\-\.])+\.([a-z]{2,7}))>/gmi},parse:function(e,t){"use strict";var n,r=0,i,s,o,u,a,f,l,c,h,p,d=[],v=0,m=0,g=0;e="\n"+e+"\n";if(t!==true){tinyMd.regexobject.lists=/^((\s*(\*|\d\.) [^\n]+)\n)+/gm}while((p=tinyMd.regexobject.code.exec(e))!==null){e=e.replace(p[0],"<code>\n"+tinyMd.htmlEncode(p[1]).replace(/\n/gm,"<br/>").replace(/\ /gm,"&nbsp;")+"</code>\n")}while((p=tinyMd.regexobject.headline.exec(e))!==null){c=p[1].length;e=e.replace(p[0],"<h"+c+">"+p[2]+"</h"+c+">"+"\n")}while((p=tinyMd.regexobject.lists.exec(e))!==null){v=0;if(p[0].trim().substr(0,1)==="*"||p[0].trim().substr(0,1)==="-"){h="<ul>"}else{h="<ol>"}a=p[0].split("\n");f=[];i=0;u=false;for(m=0;m<a.length;m++){if((n=/^((\s*)((\*|\-)|\d(\.|\))) ([^\n]+))/.exec(a[m]))!==null){if(n[2]===undefined||n[2].length===0){r=0}else{if(u===false){u=n[2].replace(/\t/,"    ").length}r=Math.round(n[2].replace(/\t/,"    ").length/u)}while(i>r){h+=f.pop();i--;v--}while(i<r){if(n[0].trim().substr(0,1)==="*"||n[0].trim().substr(0,1)==="-"){h+="<ul>";f.push("</ul>")}else{h+="<ol>";f.push("</ol>")}i++;v++}h+="<li>"+n[6]+"</li>"+"\n"}}while(v>0){h+="</ul>";v--}if(p[0].trim().substr(0,1)==="*"||p[0].trim().substr(0,1)==="-"){h+="</ul>"}else{h+="</ol>"}e=e.replace(p[0],h+"\n")}for(m=0;m<3;m++){while((p=tinyMd.regexobject.bolditalic.exec(e))!==null){h=[];if(p[1]==="~~"){e=e.replace(p[0],"<del>"+p[2]+"</del>")}else{switch(p[1].length){case 1:h=["<i>","</i>"];break;case 2:h=["<b>","</b>"];break;case 3:h=["<i><b>","</b></i>"];break}e=e.replace(p[0],h[0]+p[2]+h[1])}}}while((p=tinyMd.regexobject.links.exec(e))!==null){if(p[0].substr(0,1)==="!"){e=e.replace(p[0],'<img src="'+p[2]+'" alt="'+p[1]+'" title="'+p[1]+'" />\n')}else{e=e.replace(p[0],'<a href="'+p[2]+'">'+p[1]+"</a>\n")}}while((p=tinyMd.regexobject.mail.exec(e))!==null){e=e.replace(p[0],'<a href="mailto:'+p[1]+'">'+p[1]+"</a>")}while((p=tinyMd.regexobject.reflinks.exec(e))!==null){f=new RegExp("\\["+p[2]+"\\]: ?([^ \n]+)","gi");if((a=f.exec(e))!==null){e=e.replace(p[0],'<a href="'+a[1]+'">'+p[1]+"</a>");d.push(a[0])}}for(m=0;m<d.length;m++){e=e.replace(d[m],"")}while((p=tinyMd.regexobject.hr.exec(e))!==null){e=e.replace(p[0],"<hr/>")}e=e.replace(/ {2,}[\n]{1,}/gmi,"<br/>");return e},countingChars:function(e,t){"use strict";e=e.split(t);if(typeof e==="object"){return e.length-1}return 0},htmlEncode:function(e){"use strict";var t=document.createElement("div");t.appendChild(document.createTextNode(e));e=t.innerHTML;t=undefined;return e}};(function(e,t){"use strict";if(typeof define==="function"&&define.amd){define([],t)}else if(typeof exports==="object"){module.exports=t()}else{e.returnExports=t()}})(this,function(){"use strict";return tinyMd});

/*************************
           APP
**************************/

/******** Filter *********/

(function addCaseInsensitiveContainsSelector(){
  // NEW selector
  $.expr[':'].caseInsensitiveContains = function(a, i, m) {
    return $(a).text().toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
  };
})();

$('input.filter').keyup(function(event) {
  if(event.keyCode == 27){ $(this).val(''); }
  $('.list').find('ul li:not(:caseInsensitiveContains(' +  $(this).val() + '))').hide();
  $('.list').find('ul li:caseInsensitiveContains(' +  $(this).val() + ')').show();
});

/******** ajax stuff *********/

function baseUrl(){
  var p = document.createElement('a');
  p.href = document.URL;
  var url = '';
  if(p.protocol) url += p.protocol + '//';
  url += p.host;
  if(p.pathname) url += p.pathname;
  if(url.substr(-1) != '/') url += '/';
  return url;
}

function moveTask(task, from, to, success_callback, error_callback) {
  $.post(baseUrl()+'move_task', { task: task, from: from, to: to })
  .done(function(data){ console.log("move success!"); (success_callback(data) || function(){})(); })
  .fail(function(){ console.error("could not move task!"); (error_callback || function(){})(); });
}

function createTask(name, body, headers, lane, success_callback, error_callback){
  $.post(baseUrl()+'create_task', { name: name, body: body, lane: lane, headers: headers })
  .done(function(data){ console.log("create success!"); (success_callback(data) || function(){})(); })
  .fail(function(){ console.error("could not create task!"); (error_callback || function(){})(); });
}

function deleteTask(task, success_callback, error_callback){
  $.post(baseUrl()+'delete_task', {task: task})
  .done(function(data){ console.log("delete success!"); (success_callback(data) || function(){})(); })
  .fail(function(){ console.error("could not delete task!"); (error_callback || function(){})(); });
}

function updateTask(task, name, body, headers, success_callback, error_callback){
  $.post(baseUrl()+'update_task', {task: task, name: name, body: body, headers: headers})
  .done(function(data){ console.log("update success!"); (success_callback(data) || function(){})(); })
  .fail(function(){ console.error("could not update task!"); (error_callback || function(){})(); });
}


/* called after every action that does stuff with tasks .. erm .. refactor?! */
function updateAllTheThings() {
  /* lane values (tasks, points summary) */
  $('.connectedSortable').each(function() {
    $(this).parents('.list').siblings('.details').find('.nb-item-value').html($(this).find('li.card').length);
    var points = 0;
    $(this).find('li .points').each(function() {
      points += parseFloat($(this).attr('data-points'));
    });
    $(this).parents('.list').siblings('.details').find('.nb-pts-value').html(points);
  });

  /* event listeners */
  $('a.task-edit').off('click').on('click', function(e){
    var task = $(this).closest('li.card'),
        task_path = task.data('task-path'),
        modal = $('#task-modal');
    $.get(baseUrl()+'edit_task', { task: task_path })
    .done(function(data){
      modal.replaceWith(data);
      modal = $('#task-modal');
      var error = modal.find('.error'),
          name = modal.find('.task-name'),
          priority = modal.find('.task-priority'),
          points = modal.find('.task-points'),
          assignee = modal.find('.task-assignee'),
          type = modal.find('.task-type'),
          description = modal.find('.task-description');
      modal.find('.btn-close').off('click').on('click', function(){modal.toggleClass('active');});
      modal.find('.header').html('Edit Task');
      modal.find('.submit').off('click').on('click', function(e){
        e.stopPropagation();
        error.html('');
        updateTask(task_path, name.val(), description.val(),
          {'priority': priority.val(),
           'points': points.val(),
           'assignee': assignee.val(),
           'type': type.val()
          },
          function(data){
            task.replaceWith(data);
            updateAllTheThings();
            modal.toggleClass('active');
          },
          function(){error.html('cound not update task');}
        )
      });
      modal.toggleClass('active');
    });
  });

  $('.task-delete').off('click').on('click', function(e){
    if(!confirm("Are you sure you want to delete this task?")) return;
    var task = $(this).closest('li');
    deleteTask(task.data('task-path'), function(data){
      task.fadeOut(300, function(){ task.remove(); });
    });
  });

  /* markdown conversion */
  $('.card pre.body').replaceWith(function() {
    var md = tinyMd.parse($(this).html());
    //console.log(md);
    return '<div class="body">'+md+'</div>';
  });
}

updateAllTheThings();

/********* drag and drop stuff **********/

$('.connectedSortable').sortable({
  appendTo: document.body,
  helper: 'clone',
  cursor: 'move',
  connectWith: '.connectedSortable',
  stop: function(event, ui){}, /*fires also on sorting within one lane -- maybe implement later?*/
  receive: function(event, ui){ /*fires only when task gets dropped to another lane*/
    moveTask($(ui.item.context).data('task-path'), $(ui.sender).data('lane-path'), $(event.target).data('lane-path'),
      function(data){ /*Suceess*/
        $(ui.item.context).replaceWith(data);
        updateAllTheThings();
        if($(this).hasClass('dropped')) {
          ui.helper.remove();
          $(this).sortable('cancel').removeClass('dropped');
        }
      }, function(){ /*Error*/
        $(ui.sender).sortable('cancel');
      });
  }
}).disableSelection();

$('.connectedSortable').droppable({hoverClass: 'hover'});


/****** modal stuff *******/

$('.toggleModal').off('click').on('click', function(e){ $($(this).attr('href')).toggleClass('active'); });

$('a.task-new').off('click').on('click', function(e){
  var lane = $(this).closest('.lane').find('ul.connectedSortable'),
      lane_path = $(this).data('lane');
  var modal = $($(this).attr('href')),
      error = modal.find('.error'),
      name = modal.find('.task-name'),
      priority = modal.find('.task-priority'),
      points = modal.find('.task-points'),
      assignee = modal.find('.task-assignee'),
      type = modal.find('.task-type'),
      description = modal.find('.task-description');

  error.html(''); name.val(''); priority.val('1'); points.val('1'); assignee.val(''); description.val('');
  modal.find('.btn-close').off('click').on('click', function(){modal.toggleClass('active');});
  modal.find('.header').html('New Task');
  modal.find('.submit').off('click').on('click', function(e){
    e.stopPropagation();
    error.html('');
    createTask(name.val(), description.val(),
      {'priority': priority.val(),
       'points': points.val(),
       'assignee': assignee.val(),
       'type': type.val()
      }, lane_path,
      function(data){
        lane.prepend(data);
        updateAllTheThings();
        modal.toggleClass('active');
      },
      function(){error.html('cound not create task');}
    )
  });
  modal.toggleClass('active');
});

