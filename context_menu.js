(function($){
  $.create=function(tag, options){
    var options    = options||{}
    options.styles = options.styles||{}
    ele = document.createElement(tag)
    for(key in options.styles)
      ele.style[key] = options.styles[key]
    delete options.styles
    for(key in options)
      ele[key] = options[key]
    return ele
  }

  $.fn.contextMenu=function(opts){
    var 
      selector   = this,
      opts       = opts||{},
      items      = opts.items||[],
      iconClass  = opts.iconClass||'icomoon',
      menu       = createMenu(items),
      menuStyles = $.create('style', {
        type: 'text/css',
        id: 'context-menu-style',
        innerHTML: ".context-menu{ background:white; border:solid 1px #dcdcdc; display:none; \
          box-shadow:0px 1px 5px 1px #dcdcdc; z-index:100; }\
        .context-menu *{ padding:0; margin:0; list-style:none; }\
        .context-menu ul li:not(:last-of-type){ border-bottom:solid 1px #dcdcdc; }\
        .context-menu ul li{ padding:5px; padding-right:30px; position:relative; }\
        .context-menu ul li:hover{ background:#acacac; }"
      })
    ;
    $(selector).bind('contextmenu', function(e){ e.preventDefault(); return false; })
    if(document.querySelector('#context-menu-style') == null){ document.head.appendChild(menuStyles) }
    $(selector).each(function(ind, ele){
      $(ele).mousedown(function(e){ 
        $(selector).css({backgroundColor: ''})
        if( e.button == 2 ){ 
          $(ele).css({backgroundColor: "#E2E1FC"})
          $(menu).css({display: 'inline-block'}).offset({top: e.pageY, left: e.pageX})
          bindMenuEvents(items, ele)
        }else{
          $(menu).hide()
        }
      })
    })
    document.body.appendChild(menu)
    //******************************************************
    function createMenu(menuItems, bindToElement){
      var 
        bindToElement = bindToElement||null,
        menuID        = Math.round(Math.random(1000)*10000),
        subMenu       = $.create('div', {className: 'context-menu', id: 'context-menu-'+menuID, styles: {position: 'absolute'}}),
        list          = $.create('ul')
      ;

      menuItems.each(function(ind, ele){
        var 
          itemID   = Math.round(Math.random(1000)*10000),
          item     = $.create('li', {className: 'view clickable', id: 'context-menu-'+itemID+'-'+menuID}),
          styles   = (ele.icon ? {marginRight: '10px'} : {marginRight: '10px', opacity: 0})
        ;
        if(ele.iconURL){
          var itemIcon = $.create('span', {className: iconClass, styles: {marginRight: '10px'}})
          itemIcon.appendChild($.create('img', {src: ele.iconURL, styles:{height:'12px', width:'12px'}}))
        }else{
          var itemIcon = $.create('span', {className: iconClass, styles: styles, innerHTML: '&#x'+(ele.icon||ele.iconCode||'e6c1')+';'})
        }
        ele.selector = '#'+item.id
        item.appendChild(itemIcon)
        item.appendChild($.create('span', {innerHTML: ele.name}))
        if(ele.menu){ 
          var icon = $.create('span', {
            className: iconClass, innerHTML: '&#xe70a;',
            styles: {position:'absolute', right: '3px', top: '7px', color: '#acacac'}
          })
          item.appendChild(icon)
          createMenu(ele.menu, item) 
        }
        list.appendChild(item)
      })
      subMenu.appendChild(list)
      $(subMenu).bind('contextmenu', function(e){e.preventDefault(); return false})

      if(bindToElement == null){
        subMenu.setAttribute('selector', selector)
        return subMenu
      }else{
        $(bindToElement).unbind('mouseenter').bind('mouseenter', function(){
          $(subMenu).css({display: 'inline-block'}).offset({
            top: $(bindToElement).offset().top, 
            left: $(bindToElement).offset().left+$(bindToElement)[0].offsetWidth
          })
        }).unbind('mouseleave').bind('mouseleave', function(){
          $(subMenu).hide()
        })
        bindToElement.appendChild(subMenu)
      }
    }
    //******************************************************
    function bindMenuEvents(menuItems, clicked){
      menuItems.each(function(index, menuItem){
        if(menuItem.condition && !menuItem.condition(clicked)){
          $(menuItem.selector).hide(); return false
        }else{
          $(menuItem.selector).show()
        }
        $(menuItem.selector).unbind('click').click(function(){
          if(menuItem.clickEvent){ menuItem.clickEvent(clicked) }
          $(menuItem.selector).closest('.context-menu').hide()
          $(selector).css({backgroundColor: ''})
        })
        if(menuItem.menuItems){ bindMenuEvents(menuItem.menu, clicked) }
      })
    }
    return this
  }
}(jQuery))
