import React, { PureComponent } from 'react';
import { PanelProps } from '@grafana/data';
import { PanelOptions, Frame, DayObj, CSVRow } from 'types';
import { ResponsiveHeatMap } from '@nivo/heatmap';
import { processData } from './utils/helpFunc';
import { hours } from './config/constant';
import Icon from './img/save_icon.svg';
import useCsvDownloader from 'use-csv-downloader';

interface Props extends PanelProps<PanelOptions> {}
interface State {
  data: Array<DayObj> | null;
  csvData: Array<CSVRow>;
}

export class MainPanel extends PureComponent<Props> {
  state: State = {
    data: null,
    csvData: [],
  };

  componentDidMount() {
    const series = this.props.data.series as Frame[];

    if (series.length == 0) {
      return;
    }

    const valueArray = series[0].fields[0].values.buffer.map((elm: Frame, i: number) =>
      series.reduce((sum, curr) => sum + curr.fields[0].values.buffer[i], 0)
    );
    const timestampArray = series[0].fields[1].values.buffer;

    const { data, csvData } = processData(valueArray, timestampArray);
    this.setState({ data, csvData });
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.data.series !== this.props.data.series) {
      const series = this.props.data.series as Frame[];

      if (series.length == 0) {
        this.setState({ data: null, csvData: [] });
        return;
      }
      const valueArray = series[0].fields[0].values.buffer.map((elm: Frame, i: number) =>
        series.reduce((sum, curr) => sum + curr.fields[0].values.buffer[i], 0)
      );
      const timestampArray = series[0].fields[1].values.buffer;

      const { data, csvData } = processData(valueArray, timestampArray);
      this.setState({ data, csvData });
    }
  }

  handleDownload = () => {
    const { filename } = this.props.options;
    const downloadCsv = useCsvDownloader({ quote: '', delimiter: ';' });
    downloadCsv(this.state.csvData, `${filename}.csv`);
  };

  render() {
    const { width, height } = this.props;
    const { data } = this.state;

    if (!data) {
      return <div />;
    }

    return (
      <div
        style={{
          width,
          height,
          position: 'relative',
        }}
      >
        <img src={Icon} onClick={this.handleDownload} style={{ position: 'absolute', top: 0, right: 2, zIndex: 2 }} />
        <ResponsiveHeatMap
          data={data}
          keys={hours}
          indexBy="date"
          margin={{ top: 0, right: 0, bottom: 30, left: 10 }}
          forceSquare={true}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            orient: 'bottom',
            tickSize: 5,
            tickPadding: 5,
            tickRotation: -90,
            legend: '',
            legendOffset: 36,
          }}
          axisLeft={{
            orient: 'left',
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            //legend: 'date',
            legendPosition: 'middle',
            legendOffset: -40,
          }}
          cellOpacity={0.7}
          cellBorderColor={{ from: 'color', modifiers: [['darker', 0.4]] }}
          labelTextColor={{ from: 'color', modifiers: [['darker', 1.8]] }}
          colors="blues"
          // @ts-ignore
          defs={[
            {
              id: 'lines',
              type: 'patternLines',
              background: 'inherit',
              color: 'rgba(0, 0, 0, 0.1)',
              rotation: -45,
              lineWidth: 4,
              spacing: 7,
            },
          ]}
          fill={[{ id: 'lines' }]}
          animate={true}
          motionStiffness={80}
          motionDamping={9}
          // hoverTarget="cell"
          cellHoverOthersOpacity={0.25}
        />
      </div>
    );
  }
}
