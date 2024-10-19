import * as d3 from "d3";

export const svgNS = 'http://www.w3.org/2000/svg';

// Code originated from: https://github.com/SpectralSequences/sseq/
// exact file at https://github.com/SpectralSequences/sseq/tree/master/svg-chart/chart.js

const CHART_CSS = `:host { display: block; } circle:hover {fill: red} .struct { stroke: black; fill: none; stroke-width: 0.03; }`;


/**
 * A Web Component for a chart.
 *
 * @property {SVGGElement} contents The group containing the actual chart, as
 * opposed to e.g. the axes. Users should add their chart into this group.
 */
export class SvgChart extends HTMLElement {
    /**
     * The amount of space reserved for the axes and axes labels
     */
    static MARGIN = 30;
    /**
     * The amount of space between the axes and the axes labels
     */
    static LABEL_MARGIN = 5;
    /**
     * The amount of extra space from the edge of the chart. For example, if
     * minX = 0, then we allow users to pan to up to x = -GRID_MARGIN. This
     * allows us to fully display the class, instead of cutting it in half
     * along the grid lines.
     */
    static GRID_MARGIN = 0.5;

    public minX: number;
    public minY: number; 
    public maxX: number;
    public maxY: number;

    public height: number;
    public width: number;

    public animationId: number;

    public svg: SVGSVGElement;

    public zoom: any;
    public select: any;
    public zoomTimeout: number;

    public inner: HTMLElement;
    public axis: HTMLElement;
    public axisLabels: HTMLElement;
    public grid: HTMLElement;
    public contents: HTMLElement;
    public xBlock: HTMLElement;
    public yBlock: HTMLElement;

    public node_style: HTMLElement;
    public line_style: HTMLElement;

    static get observedAttributes() {
        return ['minx', 'miny', 'maxx', 'maxy'];
    }

    attributeChangedCallback(name, _oldValue, newValue) {
        if (name == 'minx') {
            this.minX = parseInt(newValue) - SvgChart.GRID_MARGIN;
        } else if (name == 'miny') {
            this.minY = parseInt(newValue) - SvgChart.GRID_MARGIN;
        } else if (name == 'maxx') {
            this.maxX = parseInt(newValue) + SvgChart.GRID_MARGIN;
        } else if (name == 'maxy') {
            this.maxY = parseInt(newValue) + SvgChart.GRID_MARGIN;
        }
        this.onResize();
    }

    connectedCallback() {
        this.onResize();
    }

    public set_line_style(style: string) {
        this.line_style.textContent = style;
    }

    public set_node_style(style: string) {
        this.node_style.textContent = style;
    }

    public set_size(minx, maxx, miny, maxy) {
        this.minX = parseInt(minx) - SvgChart.GRID_MARGIN;
        this.minY = parseInt(miny) - SvgChart.GRID_MARGIN;
        this.maxX = parseInt(maxx) + SvgChart.GRID_MARGIN;
        this.maxY = parseInt(maxy) + SvgChart.GRID_MARGIN;
        // this.onResize();
        
        // Zoom out to show the entire chart
        const scaleX = this.width / (this.maxX - this.minX);
        const scaleY = this.height / (this.maxY - this.minY);
        const scale = Math.min(scaleX, scaleY); // Choose the smaller scale to ensure full visibility
        
        // Reset zoom to fit the new size
        this.zoom.transform(this.select, d3.zoomIdentity.scale(scale).translate(-this.minX * scale, this.maxY * scale));
        this.onResize();
    }

    constructor() {
        super();

        this.attachShadow({ mode: 'open' });

        this.animationId = null;

        this.minX = -SvgChart.GRID_MARGIN ;
        this.minY = -SvgChart.GRID_MARGIN;
        this.maxX = SvgChart.GRID_MARGIN + 20;
        this.maxY = SvgChart.GRID_MARGIN + 20;

        this.svg = document.createElementNS(svgNS, 'svg');
        this.svg.setAttribute('xmlns', svgNS);


        const node = document.createElement('style');
        node.textContent = CHART_CSS;

        this.line_style = document.createElement('style');
        this.node_style = document.createElement('style');

        this.shadowRoot.appendChild(node);
        this.shadowRoot.appendChild(this.line_style);
        this.shadowRoot.appendChild(this.node_style);

        this.shadowRoot.appendChild(this.svg);

        this.svg.innerHTML = `
<defs>
  <pattern id="smallGrid" width="1" height="1" patternUnits="userSpaceOnUse">
    <path d="M 1 1 L 0 1 0 0" fill="none" stroke="black" stroke-width="0.01" />
  </pattern>
  <pattern id="bigGrid" width="4" height="4" patternUnits="userSpaceOnUse">
    <rect width="4" height="4" fill="url(#smallGrid)" />
    <path d="M 4 4 L 0 4 0 0" fill="none" stroke="black" stroke-width="0.03" />
  </pattern>
</defs>
<g id="inner">
  <rect id="grid" fill="url(#bigGrid)" />
  <g id="contents"></g>
</g>
<rect id="xBlock" x="${-SvgChart.MARGIN}" height="${
            SvgChart.MARGIN
        }" y="0" fill="white"/>
<rect id="yBlock" x="${-SvgChart.MARGIN}" width="${SvgChart.MARGIN}" fill="white"/>
<path id="axis" stroke="black" stroke-width="2" fill="none" />
<g id="axisLabels"></g>
`;

        for (const item of [
            'inner',
            'axis',
            'axisLabels',
            'grid',
            'contents',
            'xBlock',
            'yBlock',
        ]) {
            this[item] = this.shadowRoot.getElementById(`${item}`);
        }

        this.select = d3.select(this.svg);
        this.zoom = d3.zoom().on('zoom', this._zoomFunc.bind(this));

        if (navigator.userAgent.includes('Firefox')) {
            this.zoom.on('zoom', e => {
                this._zoomFunc(e);
                clearTimeout(this.zoomTimeout);
                this.zoomTimeout = setTimeout(() => this._zoomFunc(e), 500);
            });
        }
        window.addEventListener('resize', this.onResize.bind(this));

        this.onResize();
        this.select.call(this.zoom).on('dblclick.zoom', null);

        this.shadowRoot.addEventListener('click', this._onClick.bind(this));
    }


    replace_inner(inner: string) {
        this["contents"].innerHTML = inner;
    }

    /**
     * Add a stylesheet to the SVG.
     *
     * @return {HTMLStyleElement} The node containing the stylesheet
     */
    addStyle(style) {
        const node = document.createElementNS(svgNS, 'style');
        node.textContent = style;
        this["contents"].appendChild(node);
        return node;
    }

    _onClick(e) {
        const box = this.getBoundingClientRect();
        const [innerX, innerY] = [e.clientX - box.left, e.clientY - box.top];
        if (innerX < SvgChart.MARGIN || innerY > this.height) {
            return;
        }
        const [chartX, chartY] = d3
            .zoomTransform(this.inner)
            .invert([innerX - SvgChart.MARGIN, innerY - this.height]);

        e = new MouseEvent('clickinner', e);
        e.chartX = Math.round(chartX);
        e.chartY = Math.round(-chartY);

        /**
         * ClickInner event. This event is fired if the interior of the chart
         * is clicked. The event is identical to the original click event
         * except the chart coordinates of the events are also included
         *
         * @event SvgChart#clickinner
         * @type {object}
         * @augments MouseEvent
         * @property {number} chartX - the X coordinate in chart coordinates, rounded to nearest integer
         * @property {number} chartY - the Y coordinate in chart coordinates, rounded to nearest integer
         */
        this.dispatchEvent(e);
    }

    /**
     * Pan the chart so that the given coordinates (x, y) are at the center of the chart.
     * @param {number} x
     * @param {number} y
     */
    goto(x, y) {
        this.zoom.translateTo(this.select, x, -y);
    }

    _zoomFunc(e) {
        window.cancelAnimationFrame(this.animationId);
        this.animationId = requestAnimationFrame(() => this._zoomFuncInner(e));
    }

    _zoomFuncInner({ transform }) {
        this.inner.setAttribute('transform', transform);
        while (this.axisLabels.firstChild) {
            this.axisLabels.removeChild(this.axisLabels.firstChild);
        }
        let sep = 4;
        while (transform.k * sep < 80) {
            sep *= 2;
        }

        const minX = Math.ceil(transform.invertX(0) / sep) * sep;
        const maxX = Math.floor(transform.invertX(this.width) / sep) * sep;

        for (let x = minX; x <= maxX; x += sep) {
            const textNode = document.createElementNS(svgNS, 'text');
            textNode.textContent = x.toString();
            textNode.setAttribute('x', transform.applyX(x));
            textNode.setAttribute('y', SvgChart.LABEL_MARGIN.toString());
            textNode.setAttribute('text-anchor', 'middle');
            textNode.setAttribute('dominant-baseline', 'text-before-edge');
            this.axisLabels.appendChild(textNode);
        }

        const minY = Math.ceil(-transform.invertY(0) / sep) * sep;
        const maxY = Math.floor(-transform.invertY(-this.height) / sep) * sep;

        for (let y = minY; y <= maxY; y += sep) {
            const textNode = document.createElementNS(svgNS, 'text');
            textNode.textContent = y.toString();
            textNode.setAttribute('y', transform.applyY(-y));
            textNode.setAttribute('x', (-SvgChart.LABEL_MARGIN).toString());
            textNode.setAttribute('text-anchor', 'end');
            textNode.setAttribute('dominant-baseline', 'middle');
            this.axisLabels.appendChild(textNode);
        }
    }

    /**
     * This function should be called whenever the component's size changes.
     * This is automatically triggered when window#resize is fired, but
     * otherwise the user should call this function when the dimensions change.
     */
    onResize() {
        if (!this.isConnected) {
            return;
        }

        const size = this.getBoundingClientRect();

        this.height = size.height - SvgChart.MARGIN;
        this.width = size.width - SvgChart.MARGIN;

        const min_k = Math.min(
            this.width / (this.maxX - this.minX),
            this.height / (this.maxY - this.minY),
        );

        this.svg.setAttribute(
            'viewBox',
            `${-SvgChart.MARGIN} ${-this.height} ${size.width} ${size.height}`,
        );

        this.zoom.constrain(transform => {
            let x = transform.x;
            let y = transform.y;
            let k = transform.k;

            k = Math.max(k, min_k);

            x = Math.max(x, -this.maxX * k + this.width);
            x = Math.min(x, -this.minX * k);

            y = Math.min(y, this.maxY * k - this.height);
            y = Math.max(y, this.minY * k);

            return d3.zoomIdentity.translate(x, y).scale(k);
        });

        this.axis.setAttribute(
            'd',
            `M ${this.width} 0 L 0 0 0 ${-this.height}`,
        );

        this.xBlock.setAttribute('width', (size.width).toString());
        this.yBlock.setAttribute('y', (-this.height).toString());
        this.yBlock.setAttribute('height', size.height.toString());

        const grid_min = Math.floor(this.minX / 4) * 4;
        this.grid.setAttribute('x', grid_min.toString());
        this.grid.setAttribute(
            'width',
            (Math.ceil(this.width / min_k) + (this.minX - grid_min)).toString(),
        );

        const gridHeight = Math.ceil((this.minY + this.height / min_k) / 4) * 4;
        this.grid.setAttribute('y', (-gridHeight).toString());
        this.grid.setAttribute('height', (gridHeight + 4).toString());

        this.zoom.scaleBy(this.select, 1);
    }
}
customElements.define('svg-chart', SvgChart);
