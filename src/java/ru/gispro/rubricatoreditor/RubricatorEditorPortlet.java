package ru.gispro.rubricatoreditor;

import javax.portlet.RenderRequest;
import javax.portlet.RenderResponse;
import ru.gispro.GisproPortlet;

/**
 * RubricatorEditorPortlet Portlet Class
 */
public class RubricatorEditorPortlet extends GisproPortlet {

    @Override
    protected void doHeaders(RenderRequest request, RenderResponse response) {
        super.doHeaders(request, response);
        appendScript("/GISManagers/RubricatorEditorPortlet/script/RubricatorPanel.js", response);
        appendScript("/GISManagers/RubricatorEditorPortlet/script/RubricatorTree.js", response);
        appendScript("/GISManagers/RubricatorEditorPortlet/script/RubricatorPreview.js", response);
        appendScript("/GISManagers/RubricatorEditorPortlet/script/app.js", response);
    }
}
