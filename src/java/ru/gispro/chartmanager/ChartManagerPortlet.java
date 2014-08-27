package ru.gispro.chartmanager;

import javax.portlet.RenderRequest;
import javax.portlet.RenderResponse;
import ru.gispro.GisproPortlet;

/**
 * ChartManagerPortlet Portlet Class
 */
public class ChartManagerPortlet extends GisproPortlet {

    @Override
    protected void doHeaders(RenderRequest request, RenderResponse response) {
        super.doHeaders(request, response);
        appendScript("/GISManagers/ChartManagerPortlet/script/WMSStore.js", response);
        appendScript("/GISManagers/ChartManagerPortlet/script/ChartEditor.js", response);
        appendScript("/GISManagers/ChartManagerPortlet/script/ChartSource.js", response);
        appendScript("/GISManagers/ChartManagerPortlet/script/ChartGrid.js", response);
        appendScript("/GISManagers/ChartManagerPortlet/script/AxisParser.js", response);
        appendScript("/GISManagers/ChartManagerPortlet/script/app.js", response);
    }
}
