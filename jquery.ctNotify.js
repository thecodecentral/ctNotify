/*
 * jQuery ctRotator Plugin
 * Examples and documentation at:http://thecodecentral.com/2008/11/12/ctrotator-a-flexible-itemimage-rotator-script-for-jquery
 * Under MIT license http://www.opensource.org/licenses/mit-license.php
 *
 * @author: Cuong Tham
 * @version: 1.0
 * @requires jQuery v1.2.6 or later
 *
 * @headsTip: Customizable rotating script for displaying large quantity of items in an interesting way
 */


(function($) {



  var defaultInstanceId = 'default';
  var defaultType = 'message';
  var instData = {};



  
  $.extend({
    ctNotifyOption:function(options, instId){
      createInstnace(options, instId);
     
    },
    ctNotify:function(html, type, instId){
      

      var inst = getInstance(instId);

      addItem(html, type, instId);

      if(!inst.inTimeout){
        removeItem(instId);
      }
    }
  });

  function getInstanceIdFallback(instId){
    if(instId == null){
      return defaultInstanceId;
    }else{
      return instId;
    }
  }

  function getInstance(instId){
    instId = getInstanceIdFallback(instId);

    var inst;
    if(instData[instId] != null){
      inst = instData[instId];
    }else{
      inst = createInstnace(null, instId);
   
    }
  
 
    return inst;
  }

  function createInstnace(options, instId){
    instId = getInstanceIdFallback(instId);
    var inst = initialize(options, instId);
    return inst;
  }


  function getOptions(instId){
    return getInstance(instId).options;
  }
  

  function initialize(options, instId){
    var inst;

    if(instData[instId] && instData[instId].isInitialized){
      inst = instData[instId];
    }else{
      inst = {
        id: instId,
        con:null,
        parentCon: null,
        inTimeout: false,
        isInitialized: false,
        timerId: null,
        stickyItemCount: 0
      };
    
    }
    


    var opts = {
      delay: 3000,
      id: 'ctNotify_' + instId,
      className: 'ctNotify',
      animated: true,
      animateSpeed: 500,
      animateType: "slideUp",
      appendTo: null,
      sticky: false,
      autoWidth: 'fitWindow', //fit,fitWindow, disabled
      width: null, //if autoWidth is set to other than disabled, this option is not used
      opacity: .7,
      position: "fixed",
      bodyIdSuffix: '_body_', //the element ID which contains the notificationc children
      bodyClassName: 'ctNotify_body',
      anchors: {
        top:0,
        left: 0,
        bottom: null,
        right: null
      }, //top, left, bottom, right
      containerRender: null,
      itemRender: null
    };
    
    options = $.extend({}, opts, options);


    options.bodyId = opts.id + opts.bodyIdSuffix;

    
    if(options.appendTo == null){
      options.appendTo = $(document.body);
    }
    
    if(options.autoWidth != 'fit' && options.autoWidth != 'fitWindow'){
      options.autoWidth = 'disabled';
    }
    
    
    if(options.width != null){
      options.autoWidth = 'disabled';
    }
    



    inst.options = options;
    
    
 
    initContainer(inst);
    initItemRender(inst);
 
    inst.con = inst.options.containerRender(inst);
    inst.body = inst.con.find('#' + inst.options.bodyId);
    inst.parentCon = inst.options.appendTo;


    

    inst.con.bind('click', inst, function(e){
      if(e.data.inTimeout){
        clearTimeout(e.data.timerId);
        inst.inTimeout = false;
      }

      e.data.body.empty();
      $(this).hide();
      inst.stickyItemCount = 0;
    });


    if(inst.parentCon.size() == 0){
      throw ('Parent container ' + opt.appendTo + ' no found.');
    }

    inst.con.appendTo(inst.parentCon);



    if(inst.options.autoWidth != 'disabled'){
      $(window).resize(function(){
        fixWidth(inst); 
      });
    }


    inst.isInitialized = true;
    instData[instId] = inst;


 
    return inst;
    
  }
  
  
  function initContainer(inst){
    if(inst.options.containerRender != null){
      return;
    }
      
    inst.options.containerRender = function(inst){
      var options = inst.options;
      var conWrapper = $('<div></div>').attr({
        id:  options.id,
        title: 'click to close'
      })
      .css({
        opacity: options.opacity,
        position: options.position,
        top: options.anchors.top,
        bottom: options.anchors.bottom,
        left: options.anchors.left,
        right: options.anchors.right
      })
      .addClass(options.className)
      .hide();


      var con = $('<ul></ul>').attr({
        id: options.id + options.bodyIdSuffix
      })
      .addClass(options.bodyClassName);
      

      

      conWrapper.append(con);

      return conWrapper;
    };
    

  }
  
  function initItemRender(inst){
    if(inst.options.itemRender != null){
      return;
    }
      
    inst.options.itemRender = function(html, itemOptions, inst){
      var   span = $('<span></span>') ;
      if(itemOptions.isSticky){
        span.addClass('sticky');
      }
      span.html(html);
      return $('<li></li>').append(span);
    };
  }
    
    
  function addItem(html, type, instId){
    var inst = getInstance(instId);
    
    
    
    var options;
    if($.isPlainObject(type)){
      options = type;
    }else{
      options = {};
      options.type = type;
    }
    
    options = $.extend({
      type: defaultType,
      isSticky: inst.options.sticky,
      delay: inst.options.delay
    }, options);
    
    
    inst.con.show();
    var item = inst.options.itemRender(html, options, inst);
    item.addClass(options.type);
    inst.body.append(item);

    $(item).data('ct_delay', options.delay);
    
    if(options.isSticky){
      inst.stickyItemCount++;
      $(item).data('ct_isSticky', true);
    }

      
    fixWidth(inst);
      
   
  }

  function fixWidth(inst){
    var con = inst.con;
    
   
    if(inst.options.autoWidth == 'disabled'){
      
      if(inst.options.width != null){
        inst.con.width(inst.options.width);
      }
    }else if(inst.options.autoWidth == 'fit'){
      con.width(inst.options.appendTo.width() - (con.outerWidth() -  con.width()));
      

    }else if(inst.options.autoWidth == 'fitWindow'){
      con.width($(window).width() - (con.outerWidth() - con.width()));
    }
    
  }



  function removeItem(instId){
    
    var inst = getInstance(instId);
    var con = inst.con;
    var body = inst.body;
    var opt = inst.options;
    
    if(con == null){
      return;
    }

    var size = Math.max(body.children().size() - inst.stickyItemCount, 0);
    
   
    
    if(size == 0){
      inst.inTimeout = false;
      inst.timerId = null;
      if(body.children().size() == 0){
        con.hide();
      }else{
          
      }
      
      return;
    }else if(size > 0){
      inst.inTimeout = true;
      getInstance(instId).inTimeout = true;


      var firstRemovable = getRemovableItem(instId);
        
      if(firstRemovable != null){
        inst.timeerId = setTimeout(function(){
       
          if(opt.animated){
            firstRemovable[opt.animateType](opt.animateSpeed, function(){
              doRemoveItem(instId, firstRemovable);
            });
          }else{
            doRemoveItem(instId, firstRemovable);
          }
        

        }, firstRemovable.data('ct_delay'));
      }
    }
  }
  

  function getRemovableItem(instId){
    var inst = getInstance(instId);
    var children = inst.body.children();
    
    for(var i=0; i< children.size(); i++){
      if( $(children[i]).data('ct_isSticky') != true){
        return $(children[i]);
      }
    }
    
    return null;
  
  }

  function doRemoveItem(instId, item){
    item.remove();
    removeItem(instId);
  }
 
})(jQuery); 
