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

(/**
 * @param {Window} window
 * @param {undefined} undefined
 */
function (window, undefined)
{
	/** @constructor */
	function CDetectOSK()
	{
		// this.isMobile = AscCommon.AscBrowser.isMobile;
		this.isAndroid = AscCommon.AscBrowser.isAndroid;
		// this.isIOS = AscCommon.AscBrowser.isAppleDevices && this.isMobile;
		this.isKeyboardOpened = false;
		this.ResizeTimerId = -1;
		this.OrientationTimerId = -1;
		// на ios пока берется не правильно (берется iframe, а нужно у родительсого окна)
		this.DefaultScale = visualViewport.scale;
		this.ScalePercent = (visualViewport.scale < 1) ? ( 1 - visualViewport.scale) : (visualViewport.scale > 1) ? (visualViewport.scale) : 1;
	};
	
	CDetectOSK.prototype.IsKeyboardOpened = function()
	{
		// работает с задержкой, поэтому возможно лучше просто ждать события или может даже выполнять функцию resize и в ней сделать вызов callback (если он есть или отправлять какой-то ивент)
		return this.isKeyboardOpened;
	};

	visualViewport.addEventListener('resize', onResize, false);

	// в ios не приходит события window.onresize и visualViewport, а также нет доступа к родительскому окну, а окно iframe не изменяется.
	// поэтому приходится запрашивать из web-apps это событие с его размерами (надо бы подумать над тем как прокинуть эти данные сюда)
	if (!AscCommon.AscBrowser.isAndroid)
	{
		window.addEventListener("message", function(msg){
			if (AscCommon.CDetectOSK.ResizeTimerId != -1)
				clearTimeout(AscCommon.CDetectOSK.ResizeTimerId);
		
			var obj = JSON.parse(msg.data);
			var osk = AscCommon.CDetectOSK;
			AscCommon.CDetectOSK.ResizeTimerId = setTimeout( function() 
			{
				var coef = 1;
				var height = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

				if (osk.DefaultScale == 1) {
					coef = obj.height * obj.scale / height;
				}
				else {
					coef = obj.height * ( obj.scale + ( (obj.scale * 100) / (osk.DefaultScale * 100) ) * osk.ScalePercent) / height;
				}

				if (coef < 0.95) {
					console.log('keyboar is opened');
					osk.isKeyboardOpened = true;
				} else if (osk.isKeyboardOpened) {
					console.log('keyboad is closed');
					osk.isKeyboardOpened = false;
				}
			}, 700);
		}, false);
	}
	
	//нужно учитывать дефолтный scale (так как он может отличаться от 1)
	// либо можно посчитать сколько процентов ему не хватает до 1 и это число (в процентах) каждый раз прибавлять к scale при расчетах

	// можно и без таймаута, но тогда приходят несколько событий при смене ориентации и в антройде несколько ресайзов при открытии клавиатуры
	function onResize() {
		if (AscCommon.CDetectOSK.ResizeTimerId != -1)
			clearTimeout(AscCommon.CDetectOSK.ResizeTimerId);

		var osk = AscCommon.CDetectOSK;
		AscCommon.CDetectOSK.ResizeTimerId = setTimeout( function() 
		{
			var coef = 1;
			var height = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
			if (osk.isAndroid) {
				if (window.screen.height - 300 > window.visualViewport.height * window.visualViewport.scale) {
					console.log('keyboar is opened');
					osk.isKeyboardOpened = true;
				} else if (osk.isKeyboardOpened) {
					console.log('keyboad is closed');
					osk.isKeyboardOpened = false;
				}
			} else {
				if (osk.DefaultScale == 1) {
					coef = visualViewport.height * visualViewport.scale / height;
				}
				else {
					coef = visualViewport.height * ( visualViewport.scale + ( (visualViewport.scale * 100) / (osk.DefaultScale * 100) ) * osk.ScalePercent) / height;
				}

				if (coef < 0.95) {
					console.log('keyboar is opened');
					osk.isKeyboardOpened = true;
				} else if (osk.isKeyboardOpened) {
					console.log('keyboad is closed');
					osk.isKeyboardOpened = false;
				}
			}
			
		}, 400);
	};

	//--------------------------------------------------------export----------------------------------------------------
	window['AscCommon'] = window['AscCommon'] || {};
	window["AscCommon"].CDetectOSK = new CDetectOSK();
})(window);
