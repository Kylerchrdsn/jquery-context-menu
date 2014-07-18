(function($){
  $.extend(Array.prototype, {
    each: function(yield){ 
      for(var x = 0; x < this.length; x++){ 
        rVal = yield(x, this[x])
        if(rVal == false){ 
          break 
        }else if(rVal == true){
          continue
        }
      }
    }
  })

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
      style      = opts.style||true,
      items      = opts.items||[],
      iconClass  = opts.iconClass||'icomoon',
      menu       = createMenu(items),
      highlight  = opts.highlight||"#E2E1FC",
      menuStyles = $.create('style', {
        type: 'text/css',
        id: 'context-menu-style',
        innerHTML: ".context-menu{ background:white; border:solid 1px #dcdcdc; display:none; \
          box-shadow:0px 1px 5px 1px #dcdcdc; z-index:100; }\
        .context-menu *{ padding:0; margin:0; list-style:none; }\
        .context-menu ul li:not(:last-of-type){ border-bottom:solid 1px #dcdcdc; }\
        .context-menu ul li{ padding:5px; padding-right:30px; position:relative; white-space:nowrap; }\
        .context-menu ul li.hover:hover{ background:#acacac; }"
      })
    ;
    document.addEventListener('click', function(){
      $('.context-menu').fadeOut(300)
      $(selector).each(function(x, y){ $(y).css({backgroundColor: $(y)[0].origBackground}) })
    })
    $(selector).bind('contextmenu', function(e){ e.preventDefault(); return false; })
    if(document.querySelector('#context-menu-style') == null && style){ document.head.appendChild(menuStyles) }
    $(selector).each(function(ind, ele){
      $(ele)[0].origBackground = $(ele).css('background-color')
      $(ele).mousedown(function(e){ 
        $(selector).each(function(x, y){ $(y).css({backgroundColor: $(y)[0].origBackground}) })
        if( e.button == 2 ){ 
          $(ele).css({backgroundColor: highlight})
          $(menu).css({display: 'inline-block'})
          var winWidth = window.innerWidth
          var menuLeft = e.pageX+menu.offsetWidth
          var left     = e.pageX
          if(menuLeft>winWidth){ left -= menu.offsetWidth }
          $(menu).offset({
            top: e.pageY, left: left
          }).css({display: 'none'}).slideDown(300)
          bindMenuEvents(items, ele)
        }else{
          $(menu).fadeOut(300)
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
          item     = $.create('li', {className: 'view clickable hover', id: 'context-menu-'+itemID+'-'+menuID}),
          styles   = (ele.icon ? {textAlign: 'center', marginRight: '10px', fontSize: '12px', width: '12px', display: 'inline-block'} : {textAlign: 'center', marginRight: '10px', opacity: 0, fontSize: '12px', width: '12px', display: 'inline-block'})
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
            className: iconClass, styles: {
              position:'absolute', right: '3px', top: '50%', marginTop: '-5px',
              width: 0, height: 0, borderBottom: '5px solid transparent',
              borderTop: '5px solid transparent', borderLeft: '5px solid #acacac',
              fontSize: 0, lineHeight: 0
            }
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
          $(subMenu).css({display: 'inline-block'})
          var winWidth  = window.innerWidth
          var menuright = $(bindToElement).offset().left+$(bindToElement)[0].offsetWidth+subMenu.offsetWidth
          var left      = $(bindToElement).offset().left+$(bindToElement)[0].offsetWidth
          if(winWidth<menuright){ left -= ($(bindToElement)[0].offsetWidth+subMenu.offsetWidth) }
          $(subMenu).offset({
            top: $(bindToElement).offset().top, 
            left: left
          })
        }).unbind('mouseleave').bind('mouseleave', function(){
          $(subMenu).fadeOut(300)
        })
        bindToElement.appendChild(subMenu)
      }
    }
    //******************************************************
    function bindMenuEvents(menuItems, clicked){
      menuItems.each(function(index, menuItem){
        if(menuItem.condition && !menuItem.condition(clicked)){
          $(menuItem.selector).removeClass('hover').attr(
            'disabled', 'disabled'
          ).css({color: '#acacac'}).unbind('click')
          return true;
        }else{
          $(menuItem.selector).addClass('hover').removeAttr('disabled').css({color: 'black'})
        }
        $(menuItem.selector).unbind('click').click(function(){
          if(menuItem.clickEvent){ menuItem.clickEvent(clicked) }
          $(menuItem.selector).closest('.context-menu').fadeOut(300)
          $(selector).each(function(x, y){ $(y).css({backgroundColor: $(y)[0].origBackground}) })
        })
        if(menuItem.menuItems){ bindMenuEvents(menuItem.menu, clicked) }
      })
    }
    return this
  }
}(jQuery))
