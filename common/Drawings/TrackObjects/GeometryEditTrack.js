/*
 * (c) Copyright Ascensio System SIA 2010-2019
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation. In accordance with
 * Section 7(a) of the GNU AGPL its Section 15 shall be amended to the effect
 * that Ascensio System SIA expressly excludes the warranty of non-infringement
 * of any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For
 * details, see the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at 20A-12 Ernesta Birznieka-Upisha
 * street, Riga, Latvia, EU, LV-1050.
 *
 * The  interactive user interfaces in modified source and object code versions
 * of the Program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product
 * logo when distributing the program. Pursuant to Section 7(e) we decline to
 * grant you any rights under trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as
 * well as technical writing content are licensed under the terms of the
 * Creative Commons Attribution-ShareAlike 4.0 International. See the License
 * terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 */

"use strict";
(function(window, undefined) {

    function EditShapeGeometryTrack(originalObject) {
        this.geometry = originalObject.calcGeometry;
        this.originalShape = originalObject;
        this.originalObject = originalObject;
        this.shapeWidth = originalObject.extX;
        this.shapeHeight = originalObject.extY;
        var oPen = originalObject.pen;
        var oBrush = originalObject.brush;
        this.transform = originalObject.transform;
        this.invertTransform = originalObject.invertTransform;
        this.overlayObject = new AscFormat.OverlayObject(this.geometry, this.resizedExtX, this.originalExtY, oBrush, oPen, this.transform);
    };

    EditShapeGeometryTrack.prototype.draw = function(overlay, transform)
    {
        if(AscFormat.isRealNumber(this.originalShape.selectStartPage) && overlay.SetCurrentPage)
        {
            overlay.SetCurrentPage(this.originalShape.selectStartPage);
        }
        this.overlayObject.draw(overlay);
    };

    EditShapeGeometryTrack.prototype.track = function(kd1, kd2, e, posX, posY) {

        var geometry = this.originalObject.calcGeometry;
        var arrPathCommand = geometry.pathLst[0].ArrPathCommand;
        geometry.gdLstInfo = [];
        geometry.cnxLstInfo = [];
        geometry.pathLst[0].ArrPathCommandInfo = [];
        geometry.rectS = null;

        var invert_transform = this.invertTransform;
        var transform = this.transform;
        var _relative_x = invert_transform.TransformPointX(posX, posY);
        var _relative_y = invert_transform.TransformPointY(posX, posY);
        
        arrPathCommand[geometry.gmEditPoint.pathCommand].X = _relative_x;
        arrPathCommand[geometry.gmEditPoint.pathCommand].Y = _relative_y;


        var xMin, yMin, xMax, yMax;
        for(var i = 0;  i < arrPathCommand.length; ++i) {
            var pCommandX = transform.TransformPointX(arrPathCommand[i].X, arrPathCommand[i].Y);
            var pCommandY = transform.TransformPointY(arrPathCommand[i].X, arrPathCommand[i].Y);
            xMin = (pCommandX && !xMin || xMin > pCommandX) ? pCommandX : xMin;
            yMin = (pCommandY && !yMin || yMin > pCommandY) ? pCommandY : yMin;
            xMax = (pCommandX && !xMax || xMax < pCommandX) ? pCommandX : xMax;
            yMax = (pCommandY && !yMax || yMax < pCommandY) ? pCommandY : yMax;
        }


        var shape = this.originalShape;
        shape.spPr.xfrm.setExtX(xMax-xMin);
        shape.spPr.xfrm.setExtY(yMax - yMin);
        shape.setStyle(AscFormat.CreateDefaultShapeStyle());

        var w = xMax - xMin, h = yMax-yMin;
        var kw, kh, pathW, pathH;
        if(w > 0)
        {
            pathW = 43200;
            kw = 43200 / w;
        }
        else
        {
            pathW = 0;
            kw = 0;
        }
        if(h > 0)
        {
            pathH = 43200;
            kh = 43200 / h;
        }
        else
        {
            pathH = 0;
            kh = 0;
        }

        for(var i = 0;  i < arrPathCommand.length; ++i)
        {
            var pCommandX = transform.TransformPointX(arrPathCommand[i].X, arrPathCommand[i].Y);
            var pCommandY = transform.TransformPointY(arrPathCommand[i].X, arrPathCommand[i].Y);
            switch (arrPathCommand[i].id)
            {
                case 0:
                {
                    geometry.AddPathCommand(1, ((( pCommandX - xMin) * kw) >> 0) + "", (((pCommandY - yMin) * kh) >> 0) + "");
                    break;
                }
                case 1:
                {
                    geometry.AddPathCommand(2, (((pCommandX - xMin) * kw) >> 0) + "", (((pCommandY - yMin) * kh) >> 0) + "");
                    break;
                }
                // case 2:
                // {
                //     geometry.AddPathCommand(5, (((this.path[i].x1 - xMin) * kw) >> 0) + "", (((this.path[i].y1 - yMin) * kh) >> 0) + "", (((this.path[i].x2 - xMin)* kw) >> 0) + "", (((this.path[i].y2 - yMin) * kh) >> 0) + "", (((this.path[i].x3 - xMin) * kw) >> 0) + "", (((this.path[i].y3 - yMin) * kh) >> 0) + "");
                //     break;
                // }
            }
        }

        geometry.pathLst[0].pathW = pathW, geometry.pathLst[0].pathH = pathH;
    };

    EditShapeGeometryTrack.prototype.getBounds = function() {
        //временно, в качестве заглушки
        var bounds_checker = new  AscFormat.CSlideBoundsChecker();
        bounds_checker.init(Page_Width, Page_Height, Page_Width, Page_Height);
        this.draw(bounds_checker);
        var tr = this.originalShape.transform;
        var arr_p_x = [];
        var arr_p_y = [];
        arr_p_x.push(tr.TransformPointX(0,0));
        arr_p_y.push(tr.TransformPointY(0,0));
        arr_p_x.push(tr.TransformPointX(this.originalShape.extX,0));
        arr_p_y.push(tr.TransformPointY(this.originalShape.extX,0));
        arr_p_x.push(tr.TransformPointX(this.originalShape.extX,this.originalShape.extY));
        arr_p_y.push(tr.TransformPointY(this.originalShape.extX,this.originalShape.extY));
        arr_p_x.push(tr.TransformPointX(0,this.originalShape.extY));
        arr_p_y.push(tr.TransformPointY(0,this.originalShape.extY));

        arr_p_x.push(bounds_checker.Bounds.min_x);
        arr_p_x.push(bounds_checker.Bounds.max_x);
        arr_p_y.push(bounds_checker.Bounds.min_y);
        arr_p_y.push(bounds_checker.Bounds.max_y);

        bounds_checker.Bounds.min_x = Math.min.apply(Math, arr_p_x);
        bounds_checker.Bounds.max_x = Math.max.apply(Math, arr_p_x);
        bounds_checker.Bounds.min_y = Math.min.apply(Math, arr_p_y);
        bounds_checker.Bounds.max_y = Math.max.apply(Math, arr_p_y);

        bounds_checker.Bounds.posX = this.originalShape.x;
        bounds_checker.Bounds.posY = this.originalShape.y;
        bounds_checker.Bounds.extX = this.originalShape.extX;
        bounds_checker.Bounds.extY = this.originalShape.extY;

        return bounds_checker.Bounds;
    };

    EditShapeGeometryTrack.prototype.trackEnd = function() {

        AscFormat.CheckSpPrXfrm(this.originalShape);

    };

    window['AscFormat'] = window['AscFormat'] || {};
    window['AscFormat'].EditShapeGeometryTrack = EditShapeGeometryTrack;
})(window);

