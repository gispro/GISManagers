Ext.onReady(function() {

    grid = Ext.create('Ext.gispro.ActionLogGrid', {
        id: 'actionLogPanel',
        region: "center",
        flex: 1
    });
    
    var mainPanel = Ext.create('Ext.panel.Panel', {
        title: 'Журнал',
        split: true,
        layout: {
            type:'border', 
            align:'stretch'        
        },
        defaults: {
            split: true
        },
        items: [ grid ]        
    });
    
    
    var viewPort = new Ext.Panel({
        autoCreateViewPort: false,
        renderTo: Ext.Element.get('mainContainer'),
        layout: "fit",
        height: "100%",
        items: [ mainPanel ]
    });
    viewPort.doLayout();
    
    
    var refreshGrid = function () {
        grid.getStore().reload();
    }

//    refreshInterval = window.setInterval(function(){
//        refreshGrid()
//        },10000);


});

