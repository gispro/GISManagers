axisParser = {
    describeFeatureType: function(url, layer) {
        OpenLayers.Request.issue({
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST",
                "Access-Control-Allow-Headers": "Content-Type, Depth, User-Agent, X-File-Size, X-Requested-With, If-Modified-Since, X-File-Name, Cache-Control"
            },
            method: "GET",
            url: CONFIG.PROXY + url + "?request=describeFeatureType",
            params:{
                typename : layer
            },
            callback: function(respond){
                if(respond.status == 200){
                    axisParser.parseDescribeFeatureType([respond.responseXML]);
                }
                else {
                    Ext.Msg.alert("Ошибка","Произошла ошибка при получении информации об осях графика");
                }
            }					
        });		
    },
    parseDescribeFeatureType : function(xmlr) {
        var data = []
        ,fieldsY = []
        ,fieldsX = []
        ,allFields = []
        ,fieldsXData = []
        ,fieldsYData = []
        ,fieldsAxisType = {}

        fieldsXData.push({
            id:'name', 
            name: "Наименование"
        })

        responds = xmlr[0].getElementsByTagName('element')
		
        if (responds.length==0) responds = xmlr[0].getElementsByTagName('xsd:element')
		
        var fieldsSetted = false
        Ext.Array.each(responds,function(respond,i){
            var name = respond.attributes.getNamedItem('name').value.toUpperCase()
            var type = respond.attributes.getNamedItem('type').value.split(":")[1]
            if (((type=="decimal")||(type=="number")||(type=="double")) && (!fieldsSetted)){
                fieldsY.push(name)
                fieldsAxisType[name] = 'Numeric'
            } else if ((type=="string")&&(!fieldsSetted)){
                fieldsX.push(name)
                fieldsAxisType[name] = 'Category'
            }
        });

        allFields = Ext.Array.union(fieldsX, fieldsY)

        Ext.Ajax.request({
            method: 'get',
            url: CONFIG.PROXY + CONFIG.OVROOT + CONFIG.ALIASE_URL + "?type=field",
            params: {
                code: allFields.join(',')
            },
            scope: this,
            success: function(response){
                var aliases = Ext.Object.merge(Ext.decode(response.responseText), {
                    name: this.nameTitleAlias
                })
                Ext.Array.each(fieldsX,function(el,i){
                    var tempName = el
                    if(aliases[el])tempName = aliases[el]
                    fieldsXData.push({
                        id: el, 
                        name: tempName
                    })
                })
                Ext.Array.each(fieldsY,function(el,i){
                    var tempName = el
                    if(aliases[el])tempName = aliases[el]
                    fieldsYData.push({
                        id: el, 
                        name: tempName
                    })
                })

                this.onParseFunc.call(this, {
                    data: data
                    ,
                    allFields: allFields
                    ,
                    fieldsXData: fieldsXData
                    ,
                    fieldsYData: fieldsYData
                    ,
                    aliases: aliases
                    ,
                    fieldsAxisType: fieldsAxisType 
                })

            }
            ,
            failure: function(er){
                Ext.Msg.alert("Ошибка","Произошла ошибка при получении информации об осях графика");
            }
        })

    },
    onParseFunc : function(r) {
        var tbarArr = editor.dockedItems.items[0].items.items;
        var fieldX = tbarArr[tbarArr.length-3];
        var fieldY = tbarArr[tbarArr.length-1];
        if (r.fieldsXData.length==0 || r.fieldsYData.length==0) Ext.Msg.alert("Ошибка","На сервере отсутствует информация об осях графика");
        fieldX.getStore().loadData(r.fieldsXData);
        fieldY.getStore().loadData(r.fieldsYData);
        fieldX.select(fieldX.getValue());
        fieldY.select(fieldY.getValue());
    }
}