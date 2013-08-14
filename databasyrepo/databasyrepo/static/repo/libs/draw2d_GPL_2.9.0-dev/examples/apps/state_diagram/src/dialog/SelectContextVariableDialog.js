

example.dialog.SelectContextVariableDialog = Class.extend({
    
    init:function(successCallback){
      this.successCallback = successCallback;
    },
    
    show: function(){
        var variables = new draw2d.util.ArrayList();
        app.getView().getLines().each(function(i,line){
            variables.addAll(line.getVariables(),true);
        });

        this.container = $('#myModal');
        var container = this.container;
        var _this = this;
        
        container.modal();
        $("#myModalLabel").text("Select variable to map");

        var template ='<table class="table table-bordered  table-hover">{{#vars}}<tr data-id="{{.}}"><td>{{.}}</td></tr>{{/vars}}</table>';
        var compiled = Hogan.compile(template);
        var output = compiled.render({vars:variables.asArray()});
        container.find('.modal-body').html(output);
        
        output = $('<button class="btn" data-dismiss="modal" aria-hidden="true">Close</button><button class="btn btn-primary">Load</button>');
        container.find('.modal-footer').html(output);
        
        container.find('.btn-primary').on('click', $.proxy(function(e) {
            e.preventDefault();
            var row = $(container.find("tr.success"));
            var id = row.data("id");
            _this._onOk(id);
        },this)).attr("disabled",true);
        
        container.find("tr").dblclick(function(){
            var row = $(this);
            var id = row.data("id");
            _this._onOk(id);
        });
        container.find("tr").click(function(){
            $this = $(this);
            $this.addClass('success').siblings().removeClass('success');
            container.find('.btn-primary').attr("disabled",false);
         });

    },
    
    _onOk: function(varName){
        this.container.modal('hide');
        this.successCallback(varName);
    }
});