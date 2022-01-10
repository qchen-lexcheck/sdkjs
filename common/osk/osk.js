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
		this.isIOS					= AscCommon.AscBrowser.isAppleDevices && AscCommon.AscBrowser.isMobile; // флаг, что это ios
		this.isAndroid 				= AscCommon.AscBrowser.isAndroid; // флаг, что это android
		this.isKeyboardOpened 		= false; // флаг открыта ли в текущий момент клавиатура
		this.isChnWithKeyboard 		= false; // флаг, что смена ориентации экрана произошла с открытой клавиатурой
		this.skipResize				= false; // флаг для пропуска событий resize
		this.OrientationTimerId 	= -1; // таймер в течерии которого мы игнорируем события resize после смены ориентации экрана
		this.BrowserToolbarHeight	= screen.availHeight - window.innerHeight;
	};
	
	CDetectOSK.prototype.asc_isKeyboardOpened = function() {
		// функция возвращает true если клавиатура сейчас открыта (может работать не правильно если ещё не пришли события resize, при появлении/скрытии клавиатуры)
		var coef;
		if (this.isAndroid) {
			coef = window.innerHeight / (screen.availHeight - this.BrowserToolbarHeight);
			// если смена ориентации была с открытой клавиатурой, то при её закрытии coef должен увеличиться быть в пределах от 0.95 до 1.05
			if (this.isChnWithKeyboard  && coef >= 0.95 && coef <= 1.05)
				coef = 0.9;

		} else {
			coef = visualViewport.height * (document.documentElement.clientWidth / window.innerWidth) / document.documentElement.clientHeight;
		}
		if (coef < 0.95) {
			console.log('keyboard is opened');
			this.isKeyboardOpened = true;
			return true;
		} else {
			console.log('keyboard is closed');
			this.isKeyboardOpened = false;
			return false;
		}
	};

	window.addEventListener('orientationchange', function() {
		// нужно отслеживать для android, чтобы правильно посчитать BrowserToolbarHeight для новой ориентации экрана
		// из-за того окрыта ли клавиатура в момент смены ориентации мы по разному будем оценивать coef, который рассчитывается по запросу или при resize
		AscCommon.CDetectOSK.isChnWithKeyboard = AscCommon.CDetectOSK.isKeyboardOpened;
		console.log('AscCommon.CDetectOSK.isChnWithKeyboard = ' + AscCommon.CDetectOSK.isChnWithKeyboard);
		if (AscCommon.CDetectOSK.OrientationTimerId != -1)
			clearTimeout(AscCommon.CDetectOSK.OrientationTimerId);
	
		AscCommon.CDetectOSK.skipResize = true;
		AscCommon.CDetectOSK.OrientationTimerId = setTimeout(function() {
			// пропускаем все ресайзы, которые придут при изменении ориентации, так как клавиатуру они не закрывают и не открывают
			// но на одном из резайзов нужно будет пересчитать BrowserToolbarHeight
			AscCommon.CDetectOSK.skipResize = false;
		}, 1000);
	}, false);
	
	window.addEventListener('resize', function() {
		// это нужно для отслеживания сокрытия клавиатуры на android (чтобы при смене ориентации экрана мы знали открыта ли она сейчас)
		// нужно чтобы мы понимали, как рассматривать coef
		// без этого события будет проблема если: меняем ориентацию экрана с открытой клавиатурой, дальше её скрываем и не вызываем ни разу проверку на наличие клавиатуры опять меняем ориентацию экрана
		// по идее можно не делать проверку на android, так как в ios оно не приходит, но на всякий случай лучше добавить
		if (AscCommon.CDetectOSK.isAndroid) {
			if (AscCommon.CDetectOSK.skipResize) {
				// здесь уже можно пересчитать BrowserToolbarHeight
				AscCommon.CDetectOSK.BrowserToolbarHeight = screen.availHeight - window.innerHeight;
			} else {
				var coef = window.innerHeight / (screen.availHeight - AscCommon.CDetectOSK.BrowserToolbarHeight);
				// если смена ориентации была с открытой клавиатурой, то при её закрытии coef должен увеличиться быть в пределах от 0.95 до 1.05
				if (AscCommon.CDetectOSK.isChnWithKeyboard && coef >= 0.95 && coef < 1.05)
					coef = 0.9;
				
				if (coef < 0.95) {
					console.log('keyboard is opened');
					this.isKeyboardOpened = true;
				} else {
					console.log('keyboard is closed');
					this.isKeyboardOpened = false;
				}
			}
		}
	}, false);

	visualViewport.addEventListener('resize', function() {
		// пока нет прокидки этого события (надо подумать как его прокинуть из родительского окна)
		// это событие отслеживаем для ios (так как не приходит resize у window)
		// можно обойтись без него и просто рассчитывать по запросу
		if (!AscCommon.CDetectOSK.isAndroid && !AscCommon.CDetectOSK.skipResize) {
			var coef = visualViewport.height * (document.documentElement.clientWidth / window.innerWidth) / document.documentElement.clientHeight;
			if (coef < 0.95) {
				console.log('keyboard is opened');
				AscCommon.CDetectOSK.isKeyboardOpened = true;
			} else {
				console.log('keyboard is closed');
				AscCommon.CDetectOSK.isKeyboardOpened = false;
			}
		}
	}, false);

	// в ios не приходит события window.onresize и visualViewport, а также нет доступа к родительскому окну, а окно iframe не изменяется.
	// поэтому приходится запрашивать из web-apps это событие с его размерами (надо бы подумать над тем как прокинуть эти данные сюда)
	// по идее можно и без события обойтись, но доступа к параметрам родительского окна тоже нет
	if (!AscCommon.AscBrowser.isAndroid) {
		window.addEventListener("message", function(msg) {	
			var sizes = JSON.parse(msg.data);
			if (!AscCommon.CDetectOSK.skipResize) {
				var coef = sizes.VVheight * sizes.Zoom / sizes.Dheight;
				if (coef < 0.95) {
					console.log('keyboard is opened');
					AscCommon.CDetectOSK.isKeyboardOpened = true;
				} else {
					console.log('keyboard is closed');
					AscCommon.CDetectOSK.isKeyboardOpened = false;
				}
			}	
		}, false);
	}

	//--------------------------------------------------------export----------------------------------------------------
	window['AscCommon'] = window['AscCommon'] || {};
	window["AscCommon"].CDetectOSK = new CDetectOSK();
	// var prot = CDetectOSK.prototype;
	// prot["asc_isKeyboardOpened"] = prot.asc_isKeyboardOpened;
})(window);
