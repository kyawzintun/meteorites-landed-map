import React, { Component } from 'react';
import './App.css';

import * as d3 from 'd3';
import { geoMercator, geoPath } from "d3-geo"
import { feature } from "topojson-client"

const jsonUrl = "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/meteorite-strike-data.json";
const mapJsonUrl = "https://raw.githubusercontent.com/zimrick/react-svg-maps-tutorial/master/public/world-110m.json";
const div = d3.select("body").append("div")
.attr("class", "tooltip")
.style("opacity", 0);

const wWidth = window.innerWidth, wHeight = window.innerHeight;

class App extends Component {
  projection() {
    return geoMercator()
    .scale(300)
    .translate([ 780, 360 ])
  }

  radius(properties){
    let range = 718750/2/2;
    if (properties.mass <= range) return 2;
    else if (properties.mass <= range*2) return 10;
    else if (properties.mass <= range*3) return 20;
    else if (properties.mass <= range*20) return 30;
    else if (properties.mass <= range*100) return 40;
    return 50;
  }

  fillOpacity(d) {
    let range = 718750/2/2;
    if (d.properties.mass <= range) return 1;
    return .5;
  }

  toolTip(data, type) {
    let prop = data.properties;
    if(type === 'show') {
      div.transition()
      .duration(100)
      .style("opacity", .9);
      div.html(
        "<div class='info'>"+
          "<p>Fall: "+ prop.fall +"</p>"+
          "<p>Mass: "+ prop.mass +"</p>"+
          "<p>Name: "+ prop.name +"</p>"+
          "<p>Name Type: "+ prop.nametype +"</p>"+
          "<p>Recclass: "+ prop.recclass +"</p>"+
          "<p>Reclat: "+ prop.reclat +"</p>"+
          "<p>Year: "+ prop.year +"</p></div>")     
        .style("left", (d3.event.pageX+30) + "px")             
        .style("top", (d3.event.pageY/1.5) + "px");
    } else {
      div.transition()
      .duration(100)
      .style("opacity", 0);
    }
  }

  componentDidMount() {
    fetch(mapJsonUrl)
    .then( res => { return res.json() })
    .then( map => {
      console.log(map);
      let worldData = feature(map, map.objects.countries).features;
      fetch(jsonUrl)
      .then( res => { return res.json() })
      .then( res => {
        let hue = 0, colors = {};
        res.features.sort(function(a,b) {
          return new Date(a.properties.year) - new Date(b.properties.year);
        })
        res.features.map(function(e) {
          hue+=.35;
          colors[e.properties.year] = hue;
          e.color = 'hsl(' + hue + ',100%, 50%)';
        })
        res.features.sort(function(a,b) {
          return b.properties.mass - a.properties.mass
        })
        console.log(res);
        let landedData= res;
        this.drawMap(worldData, landedData);
      })
    })
  }

  drawMap(worldMap, landed) {
    const svg = d3.select("svg");
    const countries = svg.selectAll(".svg")
    .data(worldMap)
    .enter()
    .append("path")
    .attr("d", d => { return geoPath().projection(this.projection())(d) })
    .attr("fill", "#97E0D3")
    .attr("stroke", "#61A7B4")
    .attr("strokeWidth", 0.5)

    const landedCor = svg.selectAll(".svg")
    .data(landed.features)
    .enter()
    .append("circle")
    .attr("cx", d => { if(d.geometry) return this.projection()(d.geometry.coordinates)[0] })
    .attr("cy", d => { if(d.geometry) return this.projection()(d.geometry.coordinates)[1] })
    .attr("r", d => { return this.radius(d.properties) })
    .attr("fill", d => { return d.color })
    .attr("stroke", "#FFFFFF")
    .attr('fill-opacity', d => { return this.fillOpacity(d);})
    .on("mouseover", d => { return this.toolTip(d, 'show') })
    .on("mouseout", d => { return this.toolTip(d, 'hide')})
  }

  render() {
    return (
      <div className="App" ref="AppWrapper">
        <svg width={wWidth} height={wHeight} className="svg">
        </svg>
      </div>
    );
  }
}

export default App;
