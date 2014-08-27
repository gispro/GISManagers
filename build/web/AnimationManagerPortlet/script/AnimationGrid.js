Ext.define('Ext.gispro.AnimationGrid', {
    extend: 'Ext.grid.GridPanel',
    xtype: 'animationGrid',
    store: animationStore,
    id: 'animationGrid',
    autoScroll: true,
    columns:[
    {
        header: "Наименование", 
        dataIndex: "title", 
        flex: 3,
        sortable: true
    },
    {
        header: "Создатель", 
        flex: 5,
        dataIndex: "user_created", 
        sortable: false
    },{
        header: "Дата создания", 
        flex: 5,
        dataIndex: "date_created", 
        sortable: false
    },
    {
        header: "Изменил", 
        flex: 5,
        hidden: true,
        dataIndex: "user_modified", 
        sortable: false
    },{
        header: "Дата изменения", 
        flex: 5,
        hidden: true,
        dataIndex: "date_modified", 
        sortable: false
    }
    ],
    getSelectedRecord: function (){
        return this.getSelectionModel().getSelection()[0];
    }
});
