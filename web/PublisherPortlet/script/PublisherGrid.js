Ext.require('Ext.ux.grid.FiltersFeature');

var filters = {
    ftype: 'filters',
    local: false
};

Ext.define('Ext.gispro.PublisherGrid', {
    extend: 'Ext.grid.GridPanel',
    xtype: 'publisherGrid',
    store: publisherStore,
    features: [filters],  
    id: 'publisherGrid',
    autoScroll: true,
    columns:[
    {
        header: "Наименование", 
        dataIndex: "title", 
        flex: 7,
        sortable: true,
        filterable: true,
        filter: {
            type: 'string'
        },
        renderer: function(value, metaData, record, row, col, store, gridView){
            return value
            .replace(/>/g, '&gt;')
            .replace(/</g, '&lt;')
        }
    },
    {
        header: "Ресурс", 
        flex: 5,
        dataIndex: "resourceid", 
        sortable: true,
        filterable: true,
        filter: {
            type: 'string'
        }
    },{
        header: "Тип", 
        flex: 3,
        dataIndex: "type", 
        sortable: true,
        filterable: true,
        filter: {
            type: 'string'
        }
    }
    ],
    dockedItems: [{
        xtype: 'pagingtoolbar',
        store: publisherStore,
        dock: 'bottom'
    }],
    getSelectedRecord: function (){
        return this.getSelectionModel().getSelection()[0];
    }
});