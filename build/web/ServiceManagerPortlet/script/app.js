app = {
    currentUser: window.JOSSO_USER || ""
}

Ext.onReady(function() {
    var mainPanel = Ext.create('Ext.gispro.ServiceSettings', {
        title: 'Менеджер сервисов',
        id : 'servicesSettingsPanel'
    });
    var viewPort = new Ext.Panel({
        renderTo: 'mainContainer',
        layout: "fit",
        height: "100%",
        items: [ mainPanel ]
    });
    viewPort.doLayout();
});

