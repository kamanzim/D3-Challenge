// Defining SVG area dimensions
var svgWidth = 960;
var svgHeight = 625;

// Defining the chart's margins as an object
var chartMargin = {
  top: 20,
  right: 40,
  bottom: 100,
  left: 100
};

// Defining dimensions of the chart area
var width = svgWidth - chartMargin.left - chartMargin.right;
var height = svgHeight - chartMargin.top - chartMargin.bottom;

// Selecting the "scatter" id and appending SVG area to it, and setting the dimensions
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Appending a group to the SVG area and shift ('translate') it to the right and down to adhere
// to the margins set in the "chartMargin" object.
var chartGroup = svg.append("g") 
  .attr("height", height)
  .attr("width", width)
  .attr("transform", `translate(${chartMargin.left}, ${chartMargin.top})`);
    

// Setting parameters
var x_property = "poverty";
var y_property = "obesity";

// Updating x-scale 
function xScale(data, x_property) {
  var x_linear_scale = d3.scaleLinear()
    .domain([d3.min(data, d => d[x_property]) * 0.8,
    d3.max(data, d => d[x_property]) * 1.2
    ])
    .range([0, width]);

  return x_linear_scale;
}

// Updating y-scale
function yScale(data, y_property) {
  var y_linear_scale = d3.scaleLinear()
    .domain([d3.min(data, d => d[y_property]) * 0.8,
    d3.max(data, d => d[y_property]) * 1.1
    ])
    .range([height, 0]);

  return y_linear_scale;
}

// Updating x-axis on mouseclick
function update_x_axis(new_x_scale, x_axis) {
  var axis_bottom = d3.axisBottom(new_x_scale);
// Creating event listeners with transitions
  x_axis.transition()
    .duration(1000)
    .call(axis_bottom);

  return x_axis;
}
// Upating x-axis on y-axis labels' click
function update_y_axis(new_y_scale, y_axis) {
  var axis_left = d3.axisLeft(new_y_scale); 
  y_axis.transition()
    .duration(500)
    .call(axis_left);

  return y_axis;
}
// Updating Circles' group
function update_circles(group_circles, new_x_scale, x_property, new_y_scale, y_property) {
    group_circles.transition()
    .duration(1000)
    .attr("cx", d => new_x_scale(d[x_property]))
    .attr("cy", d => new_y_scale(d[y_property]));
  return group_circles;
}

// Updating Circles' text
function update_state_circle(state_circles, new_x_scale, x_property, new_y_scale, y_property) {
  state_circles.transition()
    .duration(1000)
    .attr("x", d => new_x_scale(d[x_property]))
    .attr("y", d => new_y_scale(d[y_property]));
  return state_circles;
}
// Updating Circles' group using tooltip
function update_circles_tooltip(x_property,y_property, group_circles) {
  console.log("updating " + x_property + " using tooltip");
  var label;

// Setting x and y axis labels using tooltip depending on the selection
  if (x_property === "poverty") {
    label = "Poverty:";
  }
  else if (x_property === "age") {
    label = "Age:";
  }
  else {
    label = "Household Income:";
  }
 
  if (y_property === "obesity") {
    ylabel = "Obesity:";
  }
  else if (y_property === "smokes") {
    ylabel = "Smokes:";
  }
  else {
    ylabel = "Lacks Healthcare:";
  }
  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function (d) {
          if (x_property === "poverty") {
            return (`${d.state}<br>${label} ${d[x_property]}%<br>${ylabel} ${d[y_property]}%`); 
          }
          else
          return (`${d.state}<br>${label} ${d[x_property]}<br>${ylabel} ${d[y_property]}%`);
    });
   
  // Updating tooltip based on "mouseover" selection
  group_circles.call(toolTip);
  group_circles.on("mouseover", function (data) {
    toolTip.show(data,this);
  })
      // onmouseout event
    .on("mouseout", function (data, index) {
      toolTip.hide(data,this);
    });

  return group_circles;
}


  // Retrieving data from "data.csv"
  d3.csv("assets/data/data.csv").then(function (data) {

  // Parsing data
  data.forEach(function(data) {
    data.poverty = +data.poverty;
    data.healthcare = +data.healthcare;
    data.age = +data.age;
    data.income = +data.income;
    data.obese = + data.obese;
    data.smokes = +data.smokes
});

  // x_linear_scale
  var x_linear_scale = xScale(data, x_property);

  // y_linear scale
  var y_linear_scale = yScale(data, y_property);
 
  // Creating initial axis functions
  var axis_bottom = d3.axisBottom(x_linear_scale);
  var axis_left = d3.axisLeft(y_linear_scale);

  // Appending x-axis
  var x_axis = chartGroup.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(axis_bottom);

  // Appending y-axis
  chartGroup.append("g")
    .call(axis_left); 

  // Appending initial circles
  var group_circles = chartGroup.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => x_linear_scale(d[x_property])) 
    .attr("cy", d => y_linear_scale(d[y_property])) 
    .attr("r", "15") 
    .attr("class", "stateCircle") 
    .attr("opacity", ".7");


  // Creating group for two x-axis labels
  var group_labels = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

 
  var poverty_label = group_labels.append("text")
    .attr("x", 0)
    .attr("y", 15)
    .attr("value", "poverty")
    .classed("active", true)
    .text("In Poverty %");

  var income_label = group_labels.append("text")
    .attr("x", 0)
    .attr("y", 30)
    .attr("value", "income")
    .classed("inactive", true)
    .text("Household Income (Median)");

    var age_label = group_labels.append("text")
    .attr("x", 0)
    .attr("y", 45)
    .attr("value", "age") 
    .classed("inactive", true)
    .text("Age (Median)");  

 
  var obesity_label = group_labels.append("text")
    .attr("transform","rotate(-90)")
    .attr("x", (chartMargin.left) * 2.5)
    .attr("y", 0 - (height -60))
    .attr("value", "obesity") 
    .classed("active", true)
    .text("Obesity (%)");

  var smokes_label = group_labels.append("text")
    .attr("transform","rotate(-90)")
    .attr("x", (chartMargin.left) * 2.5)
    .attr("y", 0 - (height -40))
    .attr("value", "smokes") 
    .classed("inactive", true)
    .text("Smokes (%)");

    var healthcare_label = group_labels.append("text")
    .attr("transform","rotate(-90)")
    .attr("x", (chartMargin.left) * 2.5)
    .attr("y", 0 - (height -20))
    .attr("value", "healthcare") 
    .classed("inactive", true)
    .text("Lacks Healthcare (%)");  


  //  Adding state text to Circles
  var state_circles = chartGroup.selectAll()
    .data(data)
    .enter()
    .append("text")
    .text(d => d.abbr)
    .attr("x", d => x_linear_scale(d[x_property])) 
    .attr("y", d => y_linear_scale(d[y_property])) 
    .attr("class", "stateText") 
    .attr("font-size", "9");


  // "update_circles_tooltip" function above csv import
  var group_circles = update_circles_tooltip(x_property, y_property,group_circles);

  // x axis labels event listener
  group_labels.selectAll("text")
    .on("click", function () { 
      // Getting value of selection
      var value = d3.select(this).attr("value");

     if(true){   
      if (value == "poverty" || value=="income" || value=="age") { 
        console.log(value)
        // Replacing x_property with value
        x_property = value;

        // functions here found above csv import
        // Updating x scale for new data
        x_linear_scale = xScale(data, x_property);

        // Updating x axis with transition
        x_axis = update_x_axis(x_linear_scale, x_axis);

             
        // Changing classes to change bold text
        if (x_property === "income") {
          income_label
            .classed("active", true)
            .classed("inactive", false);
          poverty_label
            .classed("active", false)
            .classed("inactive", true);
          age_label
            .classed("active", false)
            .classed("inactive", true); 
        }
        else if(x_property == "age"){
          age_label
          .classed("active", true)
          .classed("inactive", false);  
          poverty_label
          .classed("active", false)
          .classed("inactive", true);
          income_label
          .classed("active", false)
          .classed("inactive", true);
        }
        else {
          poverty_label
            .classed("active", true)
            .classed("inactive", false);
          income_label
            .classed("active", false)
            .classed("inactive", true);
          age_label
            .classed("active", false)
            .classed("inactive", true); 
       }

      } 
      else
            
        // Replacing "y_property" with value
        y_property = value;
        y_linear_scale = yScale(data, y_property);
       
              
        // Changing classes to change bold text
        if (y_property === "obesity") {
          obesity_label
            .classed("active", true)
            .classed("inactive", false);
          healthcare_label
            .classed("active", false)
            .classed("inactive", true);
          smokes_label
            .classed("active", false)
            .classed("inactive", true); 
        }
        else if(y_property == "healthcare"){
          healthcare_label
          .classed("active", true)
          .classed("inactive", false);  
          obesity_label
          .classed("active", false)
          .classed("inactive", true);
          smokes_label
          .classed("active", false)
          .classed("inactive", true);

        }
        else {
          smokes_label
            .classed("active", true)
            .classed("inactive", false);
          healthcare_label
            .classed("active", false)
            .classed("inactive", true);
          obesity_label
            .classed("active", false)
            .classed("inactive", true); 
       }
    
       // Updating Circles with new x values
       group_circles = update_circles(group_circles, x_linear_scale, x_property, y_linear_scale, y_property);
      // Updating Circles with state text
       state_circles = update_state_circle(state_circles, x_linear_scale, x_property, y_linear_scale, y_property); 

       // Updating tooltips with new values
       group_circles = update_circles_tooltip(x_property, y_property, group_circles);

    } 
  
  }); 

}).catch(function (error) {
  console.log(error);
});