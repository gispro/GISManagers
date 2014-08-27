package ru.gispro.publisher;

import javax.portlet.RenderRequest;
import javax.portlet.RenderResponse;
import ru.gispro.GisproPortlet;

/**
 * AnimationManagerPortlet Portlet Class
 */
public class PublisherPortlet extends GisproPortlet {

    @Override
    protected void doHeaders(RenderRequest request, RenderResponse response) {
        super.doHeaders(request, response);
        appendScript("/GISManagers/PublisherPortlet/script/PublisherSource.js", response);
        appendScript("/GISManagers/PublisherPortlet/script/PublisherEditor.js", response);
        appendScript("/GISManagers/PublisherPortlet/script/PublisherGrid.js", response);
        appendScript("/GISManagers/PublicationMonitorPortlet/script/ProcessLogStore.js", response);
        appendScript("/GISManagers/PublicationMonitorPortlet/script/ProcessLogGrid.js", response);
        appendScript("/GISManagers/PublisherPortlet/script/app.js", response);
    }

   
}
