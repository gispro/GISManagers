package ru.gispro.servicemanager;

import javax.portlet.RenderRequest;
import javax.portlet.RenderResponse;
import ru.gispro.GisproPortlet;

/**
 * ServiceManagerPortlet Portlet Class
 */
public class ServiceManagerPortlet extends GisproPortlet {


    @Override
    protected void doHeaders(RenderRequest request, RenderResponse response) {
        super.doHeaders(request, response);
        appendScript("/GISManagers/ServiceManagerPortlet/script/Stores.js", response);
        appendScript("/GISManagers/ServiceManagerPortlet/script/ServiceSettings.js", response);
        appendScript("/GISManagers/ServiceManagerPortlet/script/app.js", response);
    }
   
}
