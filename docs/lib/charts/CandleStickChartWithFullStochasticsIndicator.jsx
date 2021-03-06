"use strict";

import React from "react";
import { format } from "d3-format";
import { timeFormat } from "d3-time-format";

import { ChartCanvas, Chart, series, scale, coordinates, tooltip, axes, indicator, helper } from "../../../src/";

var { CandlestickSeries, BarSeries, LineSeries, StraightLine, StochasticSeries } = series;
var { discontinuousTimeScaleProvider } = scale;
var { CrossHairCursor, MouseCoordinateX, MouseCoordinateY, CurrentCoordinate } = coordinates;
var { EdgeIndicator } = coordinates;

var { OHLCTooltip, MovingAverageTooltip, StochasticTooltip } = tooltip;

var { XAxis, YAxis } = axes;
var { stochasticOscillator, ema } = indicator;
var { fitWidth } = helper;

class CandleStickChartWithFullStochasticsIndicator extends React.Component {
	render() {
		var height = 750;
		var { data, type, width, ratio } = this.props;

		var margin = {left: 70, right: 70, top:20, bottom: 30};

		var gridHeight = height - margin.top - margin.bottom;
		var gridWidth = width - margin.left - margin.right;

		var showGrid = true;
		var yGrid = showGrid ? { innerTickSize: -1 * gridWidth, tickStrokeOpacity: 0.1 } : {};
		var xGrid = showGrid ? { innerTickSize: -1 * gridHeight, tickStrokeOpacity: 0.1 } : {};

		var ema20 = ema()
			.id(0)
			.windowSize(20)
			.merge((d, c) => {d.ema20 = c})
			.accessor(d => d.ema20);

		var ema50 = ema()
			.id(2)
			.windowSize(50)
			.merge((d, c) => {d.ema50 = c})
			.accessor(d => d.ema50);

		var slowSTO = stochasticOscillator()
			.windowSize(14)
			.kWindowSize(1)
			.merge((d, c) => {d.slowSTO = c})
			.accessor(d => d.slowSTO);
		var fastSTO = stochasticOscillator()
			.windowSize(14)
			.kWindowSize(3)
			.merge((d, c) => {d.fastSTO = c})
			.accessor(d => d.fastSTO);
		var fullSTO = stochasticOscillator()
			.windowSize(14)
			.kWindowSize(3)
			.dWindowSize(4)
			.merge((d, c) => {d.fullSTO = c})
			.accessor(d => d.fullSTO);

		return (
			<ChartCanvas ratio={ratio} width={width} height={750}
					margin={margin} type={type}
					seriesName="MSFT"
					data={data} calculator={[ema20, ema50, slowSTO, fastSTO, fullSTO]}
					xAccessor={d => d.date} xScaleProvider={discontinuousTimeScaleProvider}
					xExtents={[new Date(2012, 0, 1), new Date(2012, 6, 2)]}>
				<Chart id={1} height={325}
						yExtents={d => [d.high, d.low]}
						padding={{ top: 10, bottom: 20 }}>
					<YAxis axisAt="right" orient="right" ticks={5} {...yGrid}/>
					<XAxis axisAt="bottom" orient="bottom" showTicks={false} outerTickSize={0} />

					<MouseCoordinateY
						at="right"
						orient="right"
						displayFormat={format(".2f")} />

					<CandlestickSeries />

					<LineSeries yAccessor={ema20.accessor()} stroke={ema20.stroke()}/>
					<LineSeries yAccessor={ema50.accessor()} stroke={ema50.stroke()}/>

					<CurrentCoordinate yAccessor={ema20.accessor()} fill={ema20.stroke()} />
					<CurrentCoordinate yAccessor={ema50.accessor()} fill={ema50.stroke()} />

					<EdgeIndicator itemType="last" orient="right" edgeAt="right"
						yAccessor={d => d.close} fill={d => d.close > d.open ? "#6BA583" : "#FF0000"}/>

					<StraightLine type="vertical" xValue={608} />;
					<StraightLine type="vertical" xValue={558} strokeDasharray="Dot" />;
					<StraightLine type="vertical" xValue={578} strokeDasharray="LongDash" />;

					<OHLCTooltip origin={[-40, -10]}/>
					<MovingAverageTooltip onClick={(e) => console.log(e)} origin={[-38, 15]}
						calculators={[ema20, ema50]}/>
				</Chart>
				<Chart id={2}
						yExtents={d => d.volume}
						height={100} origin={(w, h) => [0, h - 475]} >
					<YAxis axisAt="left" orient="left" ticks={5} tickFormat={format(".0s")}/>

					<MouseCoordinateY
						at="left"
						orient="left"
						displayFormat={format(".4s")} />

					<BarSeries yAccessor={d => d.volume} fill={d => d.close > d.open ? "#6BA583" : "#FF0000"} />
				</Chart>
				<Chart id={3}
						yExtents={slowSTO.domain()}
						height={125} origin={(w, h) => [0, h - 375]} padding={{ top: 10, bottom: 10 }} >
					<XAxis axisAt="bottom" orient="bottom" showTicks={false} outerTickSize={0} />
					<YAxis axisAt="right" orient="right" ticks={2} tickValues={slowSTO.tickValues()} />
					<MouseCoordinateY
						at="right"
						orient="right"
						displayFormat={format(".2f")} />

					<StochasticSeries calculator={slowSTO}/>
					<StochasticTooltip calculator={slowSTO} origin={[-38, 15]}>Fast STO</StochasticTooltip>
				</Chart>
				<Chart id={4}
						yExtents={fastSTO.domain()}
						height={125} origin={(w, h) => [0, h - 250]} padding={{ top: 10, bottom: 10 }} >
					<XAxis axisAt="bottom" orient="bottom" showTicks={false} outerTickSize={0} />
					<YAxis axisAt="right" orient="right" ticks={2} tickValues={fastSTO.tickValues()} />

					<MouseCoordinateY
						at="right"
						orient="right"
						displayFormat={format(".2f")} />

					<StochasticSeries calculator={fastSTO}/>
					<StochasticTooltip calculator={fastSTO} origin={[-38, 15]}>Slow STO</StochasticTooltip>
				</Chart>
				<Chart id={5}
						yExtents={fullSTO.domain()}
						height={125} origin={(w, h) => [0, h - 125]} padding={{ top: 10, bottom: 10 }} >
					<XAxis axisAt="bottom" orient="bottom" {...xGrid} />
					<YAxis axisAt="right" orient="right" ticks={2} tickValues={fullSTO.tickValues()} />

					<MouseCoordinateX
						at="bottom"
						orient="bottom"
						displayFormat={timeFormat("%Y-%m-%d")} />
					<MouseCoordinateY
						at="right"
						orient="right"
						displayFormat={format(".2f")} />

					<StochasticSeries calculator={fullSTO}/>
					<StochasticTooltip calculator={fullSTO} origin={[-38, 15]}>Full STO</StochasticTooltip>
				</Chart>
				<CrossHairCursor />
			</ChartCanvas>
		);
	}
}
CandleStickChartWithFullStochasticsIndicator.propTypes = {
	data: React.PropTypes.array.isRequired,
	width: React.PropTypes.number.isRequired,
	ratio: React.PropTypes.number.isRequired,
	type: React.PropTypes.oneOf(["svg", "hybrid"]).isRequired,
};

CandleStickChartWithFullStochasticsIndicator.defaultProps = {
	type: "svg",
};
CandleStickChartWithFullStochasticsIndicator = fitWidth(CandleStickChartWithFullStochasticsIndicator);

export default CandleStickChartWithFullStochasticsIndicator;
