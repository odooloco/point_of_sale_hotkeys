odoo.define('hotkeys', function (require) {
	"use strict";

	// Se importan los modulos necesarios
	var core = require('web.core');
	var models = require('point_of_sale.models');
	var session = require('web.session');
	var PosDB = require('point_of_sale.DB');
	var Gui = require('point_of_sale.gui');
	var chrome = require('point_of_sale.chrome');
	var ajax = require('web.ajax');
	var rpc = require('web.rpc');
	var data = require('web.data');
	var PosBaseWidget = require('point_of_sale.BaseWidget');
	var Screens = require('point_of_sale.screens');



	var _super_posmodel = models.PosModel.prototype;
	models.PosModel = models.PosModel.extend({
	    initialize: function(session, attributes) {
	    	var self = this;
	    	_super_posmodel.initialize.call(this,session,attributes);
	    	self.guiIsReady();
	    },
	    guiIsReady : function(){
	    	var self = this;
	    	$(document).ready(function(){
				self.ready.done(function(){
					self.addEvents();
				});
			})
	    },
	    eventPayment : function( type ){
			var self = this;
	    	var payment_selected = $('.paymentmethod').hasClass('payment_selected');
	    	if( ! payment_selected ){
				$('.paymentmethod').each(function(){
					$(this).addClass('payment_selected');
	    			return false;					
				});	    		
	    	} else {
	    		payment_selected = false;
	    		var payment_obj = false;

	    		if( type == 'down' ){
	    			$('.paymentmethods > .paymentmethod').each(function(){
		    			if( payment_selected ){
		    				payment_obj.removeClass('payment_selected');
		    				$(this).addClass('payment_selected');

		    				payment_obj = false;
		    				payment_selected = false;

		    				return false;
		    			}

		    			payment_selected = $(this).hasClass('payment_selected');
		    			payment_obj = $(this);
		    		});
	    		} else if ( type == 'up' ) {
	    			
	    			$('.paymentmethods > .paymentmethod').each(function(){
	    				payment_selected = $(this).hasClass('payment_selected');

	    				if( $('.product:first').hasClass('payment_selected') ){
	    					return false;
	    				}

	    				if( payment_selected && payment_obj  ){
	    					$(this).removeClass('payment_selected');
	    					payment_obj.addClass('payment_selected');

	    					payment_obj = false;
		    				payment_selected = false;

		    				return false;
	    				}
	    				payment_obj = $(this);	    				
	    			});
	    		}
	    	}
	    },
	    eventOrderLine : function( type ){
	    	var selected = false;
	    	var obj = false;
			$('li.orderline').each(function(){
				if( type == 'down' ){
					if( selected ){
						$(this).click();
						selected = false;
					}
					if( $(this).hasClass('selected') ){
						selected = true
					}
				} else if( type == 'up' ) {
					if( $(this).hasClass('selected') ){
						if( obj  ){
							obj.click();	
						}						
					}
					obj = $(this);
				}				
			});
	    },
	    eventProduct : function( type ){
	    	var self = this;
	    	var product_selected = $('.product').hasClass('product_selected');
	    	if( ! product_selected ){
				$('div.product-list > .product').each(function(){
					$(this).addClass('product_selected');
	    			return false;					
				});	    		
	    	} else {
	    		product_selected = false;
	    		var product_obj = false;

	    		if( type == 'right' ){
	    			$('div.product-list > .product').each(function(){
		    			if( product_selected ){
		    				product_obj.removeClass('product_selected');
		    				$(this).addClass('product_selected');

		    				product_obj = false;
		    				product_selected = false;

		    				return false;
		    			}
		    			product_selected = $(this).hasClass('product_selected');
		    			product_obj = $(this);
		    		});
	    		} else if ( type == 'left' ) {
	    			
	    			$('div.product-list > .product').each(function(){
	    				product_selected = $(this).hasClass('product_selected');

	    				if( $('.product:first').hasClass('product_selected') ){
	    					return false;
	    				}

	    				if( product_selected  ){
	    					$(this).removeClass('product_selected');
	    					product_obj.addClass('product_selected');

	    					product_obj = false;
		    				product_selected = false;

		    				return false;
	    				}
	    				product_obj = $(this);	    				
	    			});
	    		} else if ( type == 'down' ) {
	    			var width = $('.product-list').width();
	    			var products = Math.round(width / 142);
	    			if( (width / 142 ) < 3 ){
	    				products = 2;
	    			}	    			
	    			for( var n = 1; n <= products; n++ ){
	    				self.eventProduct('right');
	    			}

	    		} else if ( type == 'up' ) {
	    			var width = $('.product-list').width();
	    			var products = Math.round(width / 142);

	    			if( (width / 142 ) < 3 ){
	    				products = 2;
	    			}
	    			for( var n = 1; n <= products; n++ ){
	    				self.eventProduct('left');
	    			}
	    		}	
	    	}
		},
		eventReturn : function(){
			var self = this;

	    	keyboardJS.bind('enter', function(e){
				if($('.popup-password').is(":visible")){
	    			var confirm = $('div.popup-password > div.centered > .confirm');
					confirm.click();
					return;
	    		}

				if( ! $('.next').is(":visible") ){
					console.log('testtt', $('.searchbox > input').is(":focus"));

					if( $('.searchbox > input').is(":focus") ){
						$('.searchbox > input').blur();
					} else {						
						var product_selected = $('.product').hasClass('product_selected');

						if( product_selected ){
							$('.product.product_selected').click();
							$('.product').removeClass('product_selected');

							return;
						}
					}

					
				} else {

					if($('.print').is(":visible")){
						$('.next').click();
						return;
					}

					var payment_selected = $('.payment_selected');
					if( payment_selected.length > 0 ){
						payment_selected.click();
						$('.paymentmethod').removeClass('payment_selected');
						e.preventDefault();
						return;
					}			
				}
			});
	    },


	    addEvents : function(){
			var self = this;

			keyboardJS.bind('enter', function(e) {

				if($('.print').is(":visible")){
						$('.next').click();
						return;
				}
				
				var confpayment = $('.payment_selected');
				if(confpayment.length > 0){
                    
					confpayment.click();
					$('.paymentmethod').removeClass('payment_selected');
					e.preventDefault();
					return;
				}

				var pselected = $('.product_selected');	
				if(pselected.length > 0){
                    
					pselected.click();
					$('.product').removeClass('product_selected');
					$('.searchbox > input').blur();
					e.preventDefault();
					return;
				}				
			});
			
			keyboardJS.bind('num1', function(e) {
				if( ! $('.next').is(":visible") && !$('.new-customer').is(":visible")){
					$(".number-char" )[0].click();
					keyboardJS.pause();
					keyboardJS.resume();
				}
			});	  
			
			keyboardJS.bind('num2', function(e) {
				if( ! $('.next').is(":visible") && !$('.new-customer').is(":visible")){
					$(".number-char" )[1].click();
					keyboardJS.pause();
					keyboardJS.resume();
				}
			});	 
			
			keyboardJS.bind('num3', function(e) {	
				if( ! $('.next').is(":visible") && !$('.new-customer').is(":visible")){			
					$(".number-char" )[2].click();
					keyboardJS.pause();
					keyboardJS.resume();
				}
			});	 
			
			keyboardJS.bind('num4', function(e) {	
				if( ! $('.next').is(":visible") && !$('.new-customer').is(":visible")){			
					$(".number-char" )[3].click();
					keyboardJS.pause();
					keyboardJS.resume();
				}
			});	 
			
			keyboardJS.bind('num5', function(e) {	
				if( ! $('.next').is(":visible") && !$('.new-customer').is(":visible")){			
					$(".number-char" )[4].click();
					keyboardJS.pause();
					keyboardJS.resume();
				}
			});	 
			
			keyboardJS.bind('num6', function(e) {		
				if( ! $('.next').is(":visible") && !$('.new-customer').is(":visible")){		
					$(".number-char" )[5].click();
					keyboardJS.pause();
					keyboardJS.resume();
				}
			});	 
			
			keyboardJS.bind('num7', function(e) {		
				if( ! $('.next').is(":visible") && !$('.new-customer').is(":visible")){		
					$(".number-char" )[6].click();
					keyboardJS.pause();
					keyboardJS.resume();
				}
			});	 
			
			keyboardJS.bind('num8', function(e) {	
				if( ! $('.next').is(":visible") && !$('.new-customer').is(":visible")){			
					$(".number-char" )[7].click();
					keyboardJS.pause();
					keyboardJS.resume();
				}
			});	 
			
			keyboardJS.bind('num9', function(e) {	
				if( ! $('.next').is(":visible") && !$('.new-customer').is(":visible")){			
					$(".number-char" )[8].click();
					keyboardJS.pause();
					keyboardJS.resume();
				}
			});	 
			
			keyboardJS.bind('num0', function(e) {		
				if( ! $('.next').is(":visible") && !$('.new-customer').is(":visible")){		
					$(".number-char" )[9].click();
					keyboardJS.pause();
					keyboardJS.resume();
				}
			});	 
			
			keyboardJS.bind('numdecimal', function(e) {	
				if( ! $('.next').is(":visible") && !$('.new-customer').is(":visible")){			
					$(".number-char" )[10].click();
					keyboardJS.pause();
					keyboardJS.resume();
				}
            });	 

	    	keyboardJS.bind('-', function(e){
	    		if( ! $('.next').is(":visible") && !$('.new-customer').is(":visible")){
	    			$('.numpad-minus').click();
					keyboardJS.pause();
					keyboardJS.resume();
	    		}				
			});

	    	keyboardJS.bind('c', function(e){
	    		if($('.popup-password').is(":visible")){
	    			var clear = $('div[class="popup-numpad"] > button.numpad-char[data-action="CLEAR"]')[1];
					clear.click();
	    		} else if( ! $('.next').is(":visible") ){
	    			$('.mode-button[data-mode="quantity"]').click();
	    		}				
			});

			keyboardJS.bind('d', function(){
				if( ! $('.next').is(":visible") ){
					$('.mode-button[data-mode="discount"]').click();
				}
			});

			keyboardJS.bind('p', function(){
				if( ! $('.next').is(":visible") ){
					$('.mode-button[data-mode="price"]').click();
				}
				
			});

			keyboardJS.bind('backspace', function(){
				if($('.popup-password').is(":visible")){
	    			var backspace = $('div[class="popup-numpad"] > button.numpad-backspace[data-action="BACKSPACE"]')[1];
					backspace.click();
					return;
	    		}

				if( ! $('.next').is(":visible") ){
					$('.numpad-backspace')[0].click();	
				} else {

					if( $('.back').is(":visible") ){
						//$('.back').click();
					}
				}
				
			});

			
			keyboardJS.bind('ctrl+b', function(){
				if( ! $('.next').is(":visible") ){
					$('.search-clear').click();
					$('.searchbox > input').focus();
				}
			});

			keyboardJS.bind('esc', function(){
				if($('.popup-password').is(":visible")){
	    			var cancel = $('div.popup-password > div.centered > .cancel');
					cancel.click();
					return;
	    		}

				if( $('.back').is(":visible") ){
					$('.back').click();
					return;
				}
			});

			keyboardJS.bind('ctrl+c', function() {
			    if( ! $('.next').is(":visible") ){
					$('.set-customer').click();
					$('.searchbox > input').focus();
				}
			});


			keyboardJS.bind('ctrl+enter', function(){
				if( ! $('.next').is(":visible") ){
					$('.pay').click();
				} else {
					//$('.next').click();
				}
			});


			keyboardJS.bind('ctrl+up', function(){
				if( ! $('.next').is(":visible") ){
					self.eventOrderLine('up');
				} 

			});

			keyboardJS.bind('ctrl+down', function(){
				if( ! $('.next').is(":visible") ){
					self.eventOrderLine('down');
				} 

			});

			keyboardJS.bind('down', function(){
				if( ! $('.next').is(":visible") ){
					self.eventProduct('down');
				} else {
					self.eventPayment('down');
				}
			});

			keyboardJS.bind('up', function(){
				if( ! $('.next').is(":visible") ){
					self.eventProduct('up');
				} else {
					self.eventPayment('up');
				}
			});

			keyboardJS.bind('right', function(){
				if( ! $('.next').is(":visible") ){
					self.eventProduct('right');
				} else {
					
				}

			});

			keyboardJS.bind('left', function(){
				if( ! $('.next').is(":visible") ){
					self.eventProduct('left');
				}
			});

			var intervalPaymentMethos = setInterval(function(){
				var payment_selected = $('.payment_selected');
				var payment_lines = $('.paymentlines').is(':visible');

				if( payment_selected.length == 0 && ! payment_lines  ){
					if( $('.next').is(":visible") ){
						self.eventPayment('down');
						//clearInterval( intervalPaymentMethos );
					}  
				}

				$('.paymentmethod').unbind('dblclick');
				$('.paymentmethod').dblclick(function(e){
					$('.delete-button:last').click();
					$('.paymentline:last').click();
				});

				$('.paymentmethod').unbind('click');
				$('.paymentmethod').click(function(){
					$('.paymentmethod').removeClass('payment_selected')
				});
			}, 200);


			setTimeout(function(){
				var s = [];
				$('div[class="numpad"] > button.number-char').each(function(){
					var num = $(this).html();
					var obj = $(this);

					if( s.indexOf( num ) == -1 ){
						s.push( num );

						keyboardJS.bind(num, function(){
							if($('.popup-password').is(":visible")){
								
								var num_pass = $('div[class="popup-numpad"] > button.number-char[data-action="'+ num +'"]')[1];
								num_pass.click();

							} else if( ! $('.next').is(":visible") ){
								obj.click();
							}
						});						
					}
				});
			}, 3000);
	    }

	});
 });
