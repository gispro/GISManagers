package ru.gispro.actionlog;

import javax.portlet.RenderRequest;
import javax.portlet.RenderResponse;
import ru.gispro.GisproPortlet;

/**
 * AnimationManagerPortlet Portlet Class
 */
public class ActionLogPortlet extends GisproPortlet {

    @Override
    protected void doHeaders(RenderRequest request, RenderResponse response) {
        super.doHeaders(request, response);
        appendScript("/GISManagers/ActionLogPortlet/script/ActionLogStore.js", response);
        appendScript("/GISManagers/ActionLogPortlet/script/ActionLogGrid.js", response);
        appendScript("/GISManagers/ActionLogPortlet/script/app.js", response);
    }
}
