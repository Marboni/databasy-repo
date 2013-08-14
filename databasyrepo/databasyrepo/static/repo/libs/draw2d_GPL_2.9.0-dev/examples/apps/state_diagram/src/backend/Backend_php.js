

example.backend.Backend = Class.extend({
	
    definitions : {},
    
	init:function(){
      
	},
	
    /**
     * @method
     * Called if the selection in the canvas has been changed. You must register this
     * class on the canvas to receive this event.
     * 
     * @param {draw2d.Figure} figure
     */
    getDefinitions : function(successCallback, errorCallback){
        $.getJSON( "backend/php/getFiles.php" , function(data){
            successCallback(data);
        });
    },
    

	getActivities: function(successCallback){
		successCallback( [
		  	            { id:"NOP",
		  	              parameters: []
		  	            },
                        { id:"ReloadDefinitions",
	                      parameters:[]
	                    },
	                    { id:"PoiCount",
	                      parameters:[{activityParameter:"requestedDay"}]
	                    },
			            { id:"IntentDeleteFromListInContext",
				  	      parameters:[{activityParameter:"indexOfIntent"}]
   		                },
			            { id:"IntentRequestForDay",
			  	          parameters:[{activityParameter:"requestedDay"}]
   		                }
	           ]);
	},

    create: function(definitionId, successCallback, errorCallback){
        $.post("backend/php/createFile.php",  { 
            id: definitionId
        }).done(function(data) {
            successCallback(data);
        });
    }, 
    
    del: function(definitionId, successCallback, errorCallback){
        $.post("backend/php/deleteFile.php",  { 
            id: definitionId
        }).done(function(data) {
            successCallback(data);
        });
    }, 
        
    save: function(definitionId, content, successCallback, errorCallback){
        $.post("backend/php/saveFile.php",  { 
            id: definitionId,
            content: JSON.stringify(content,null,2)
        }).done(function(data) {
            successCallback();
        });
    },
    
    load:  function(definitionId, successCallback, errorCallback){
        $.getJSON( "backend/php/getFile.php?id="+definitionId , function(data){
            successCallback(data);
        });
    }
    
});

