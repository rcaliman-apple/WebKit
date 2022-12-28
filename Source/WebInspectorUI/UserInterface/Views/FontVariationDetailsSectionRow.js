/*
 * Copyright (C) 2023 Apple Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE INC. AND ITS CONTRIBUTORS ``AS IS''
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL APPLE INC. OR ITS CONTRIBUTORS
 * BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF
 * THE POSSIBILITY OF SUCH DAMAGE.
 */

WI.FontVariationDetailsSectionRow = class FontVariationDetailsSectionRow extends WI.DetailsSectionRow
{
    constructor(fontVariationAxis, abortSignal)
    {
        super();

        this.element.classList.add("font-variation");

        let {name, tag, value, defaultValue, minimumValue, maximumValue} = fontVariationAxis;

        console.assert(typeof tag === "string" && tag.length === 4, "Invalid font variation axis tag", tag);

        this._labelElement = document.createElement("div");
        this._labelElement.className = "label";
        this.element.appendChild(this._labelElement);

        this._tagElement = document.createElement("div");
        this._tagElement.className = "tag";
        this.element.appendChild(this._tagElement);

        this._variationRangeElement = document.createElement("div");
        this._variationRangeElement.className = "variation-range";
        this.element.appendChild(this._variationRangeElement);

        this._inputRangeElement = document.createElement("input");
        this._inputRangeElement.setAttribute("type", "range");
        this._inputRangeElement.setAttribute("name", tag);
        this._inputRangeElement.setAttribute("min", minimumValue);
        this._inputRangeElement.setAttribute("max", maximumValue);
        this._inputRangeElement.setAttribute("value", value ?? defaultValue);
        this._inputRangeElement.setAttribute("step", this._getAxisResolution(minimumValue, maximumValue));
        this._variationRangeElement.appendChild(this._inputRangeElement);

        this._variationMinValueElement = document.createElement("div");
        this._variationMinValueElement.className = "variation-minvalue";
        this._variationMinValueElement.textContent = this._formatAxisValueAsString(minimumValue);
        this._variationRangeElement.appendChild(this._variationMinValueElement);

        this._variationMaxValueElement = document.createElement("div");
        this._variationMaxValueElement.className = "variation-maxvalue";
        this._variationMaxValueElement.textContent = this._formatAxisValueAsString(maximumValue);
        this._variationRangeElement.appendChild(this._variationMaxValueElement);

        this._inputRangeElement.addEventListener("input", (event) => {
            this.dispatchEventToListeners(WI.FontVariationDetailsSectionRow.Event.VariationValueChanged, {tag: event.target.name, value: event.target.value});
        }, {signal: abortSignal});

        this._valueElement = document.createElement("div");
        this._valueElement.className = "value";
        this.element.appendChild(this._valueElement);

        this.tag = tag;
        this.label = name;
        this.value = value ?? defaultValue;

        this._defaultValue = defaultValue;
        this._warningMessage = null;
        this._warningElement = null;
    }

    // Public

    get tag()
    {
        return this._tag;
    }

    set tag(value)
    {
        this._tag = value;
        this._tagElement.textContent = value;
    }

    get label()
    {
        return this._label;
    }

    set label(label)
    {
        this._label = label || "";

        if (this._label instanceof Node) {
            this._labelElement.removeChildren();
            this._labelElement.appendChild(this._label);
        } else
            this._labelElement.textContent = this._label;
    }

    get value()
    {
        return this._value;
    }

    set value(value)
    {
        this._value = value ?? this._defaultValue;

        this._inputRangeElement.value = this._value;
        this._valueElement.textContent = this._formatAxisValueAsString(this._value);
    }

    get warningMessage()
    {
        return this._warningMessage;
    }

    set warningMessage(message)
    {
        if (this._warningMessage === message)
            return;

        this._warningMessage = message;
        this.element.title = this._warningMessage ?? "";

        if (!this._warningElement) {
            this._warningElement = document.createElement("div");
            this._warningElement.className = "warning";
        }

        if (!this._warningElement.parentNode && this._warningMessage)
            this.element.appendChild(this._warningElement);
        else
            this._warningElement.remove();
    }

    // Private

    _formatAxisValueAsString(value)
    {
        const options = {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
            useGrouping: false,
        }
        return value.toLocaleString(undefined, options);
    }

    _getAxisResolution(min, max)
    {
        let delta = parseInt(max, 10) - parseInt(min, 10);
        if (delta <= 1) {
          return 0.01;
        } else if (delta <= 10) {
          return 0.1;
        }

        return 1;
    }
};

WI.FontVariationDetailsSectionRow.Event = {
    VariationValueChanged: "font-variation-value-changed",
};
