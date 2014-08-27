Ext.define('Ext.gispro.ChartGrid', {
    extend: 'Ext.grid.GridPanel',
    xtype: 'chartGrid',
    store: chartStore,
    id: 'chartGrid',
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
    }/*,{
        id: "is_default", 
        header: "Использовать по умолчанию", 
        dataIndex: "is_default", 
        sortable: false, 
        width: 200,
        constructor : function(config){ 
            this.callParent(arguments); 
            if (this.rowspan) { 
                this.renderer = Ext.Function.bind(this.renderer, this); 
            } 
        }, 
        fixed: true, 
        hideable: false, 
        menuDisabled: true, 
        renderer: function(value, metaData, record, rowIdx, colIdx, store) { 
            var checked = "";
            if (record.data.is_default===true || record.data.is_default==="t") {
                checked="checked=true"
                }
            return '<input '+ checked + ' onchange=setDefault('+rowIdx+') type=radio name=def>';
        } 
    },*/
    
    ],
    getSelectedRecord: function (){
        return this.getSelectionModel().getSelection()[0];
    }
});
