package ru.gispro.publicationmonitor;

import javax.portlet.RenderRequest;
import javax.portlet.RenderResponse;
import ru.gispro.GisproPortlet;

/**
 * AnimationManagerPortlet Portlet Class
 */
public class PublicationMonitorPortlet extends GisproPortlet {

    @Override
    protected void doHeaders(RenderRequest request, RenderResponse response) {
        super.doHeaders(request, response);
        appendScript("/GISManagers/PublicationMonitorPortlet/script/ProcessLogStore.js", response);
        appendScript("/GISManagers/PublicationMonitorPortlet/script/ProcessLogGrid.js", response);
        appendScript("/GISManagers/PublicationMonitorPortlet/script/app.js", response);
    }
   
}
