import React, { Component } from 'react';
import data from './data.json';
import './App.css';

function importAll(r) {
  let images = {};
  r.keys().map((item, index) => { return images[item.replace('./', '')] = r(item); });
  return images;
}
const images = importAll(require.context('./img', false, /\.(png|jpe?g|svg|gif)$/));

var key=0;
function getKey() {
  return key++;
}

class App extends Component {
  render() {
    return (
      <div>
        <Background/>
        <Site/>
      </div>
    );
  }
}

class Site extends Component {
  constructor(props) {
    super(props);
    this.state = { section: "Bio"};

    this.navigate = this.navigate.bind(this);
  }

  navigate(section) {
    this.setState({section: section});
  }

  render() {
    return (
      <div className="wrap">
        <Header data={data.header}/>
        <Nav data={data.sections} section={this.state.section} navigate={this.navigate}/>
        <Content data={data.sections} section={this.state.section} navigate={this.navigate}/>
        <Footer data={data.footer}/>
      </div>
    );
  }
}

class Background extends Component {
  render() {
    function stars(n, c) {
      c = c || "fff";
      var s = "";
      function rand(min,max) { return Math.round(Math.random() * (max - min) + min); }
      for (var i=0; i<n; i++) {
        s += rand(0,window.innerWidth) + "px " + rand(0,2000) + "px 1px #" + c + ((i+1!==n) ? ", " : ""); 
      }
      return s;
    }
    var animate = (window.innerWidth > 1000 && window.innerWidth < 2000),
        s = stars(1000),
        m = stars(500),
        l = stars(250);
    return (
      <div className="background gradient">
        <div style={{boxShadow: s, animation: (animate) ? "stars 30s linear infinite" : ""}}/>
        <div style={{boxShadow: s, animation: (animate) ? "stars 30s linear infinite" : ""}}/>
        <div style={{boxShadow: m,  animation: (animate) ? "stars 60s linear infinite" : ""}}/>
        <div style={{boxShadow: m,  animation: (animate) ? "stars 60s linear infinite" : ""}}/>
        <div style={{boxShadow: l,  animation: (animate) ? "stars 90s linear infinite" : ""}}/>
        <div style={{boxShadow: l,  animation: (animate) ? "stars 90s linear infinite" : ""}}/>
      </div>
    );
  }
}

class Carousel extends Component {
  constructor(props) {
    super(props);
    this.state = { axis: props.axis||"Y" };
    this.calcDims = this.calcDims.bind(this);
  }

  calcDims(e) {
    var self = this,
        h = this.refs.carousel.offsetHeight,
        w = this.refs.carousel.offsetWidth,
        s = (this.state.axis==="Y") ? w : h; 
    this.setState({z: Math.round((s/2) / (Math.tan(Math.PI / this.props.faces.length))), transition: ""});
    setTimeout(function() {
      self.setState({transition: "1s"});
    });
  }

  componentDidMount() {
    window.addEventListener("resize", this.calcDims)
    this.calcDims();
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.calcDims)
  }

  render() {
    var self = this;
    return (
      <div className="carousel-wrapper" onClick={this.rotate} ref="carousel">
        <div className="carousel" style={{transition: this.state.transition, transform: "translateZ(-" + this.state.z + "px) rotate" + this.state.axis + "(-" + this.props.face*(360 / this.props.faces.length) +"deg)"}}>
          {this.props.faces.map((face, i, faces) => {
            return (
              <div style={{transform: "rotate" + this.state.axis + "(" + i*(360 / faces.length) + "deg) translateZ(" + self.state.z + "px)", zIndex: (self.props.face===i) ? "1" : "-1" }} key={getKey()} ref={i}>
                {face}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

class Header extends Component {
  render() {
    return (
      <div className="header">
        <svg>
          <rect className="knockout-text-bg" width="100%" height="100%" fill="rgba(0,125,255,0.7)" x="0" y="0" mask="url(#knockout-txt)"/>
          <mask id="knockout-txt">
            <rect width="100%" height="100%" fill="#fff" x="0" y="0"></rect>
            <text x="50%" y="50%" fill="#000" alignmentBaseline="central" textAnchor="middle">Chris Huber-Lantz</text>
          </mask>
        </svg>
      </div>
    );
  }
}

class Nav extends Component {
  render() {
    var self = this;
    const items = Object.keys(this.props.data).map((title) => {
      return (
        <li key={title} onClick={() => {self.props.navigate(title)}} className={(title===self.props.section) ? "active" : ""}>{title}</li>
      );
    });
    return (
      <div className="nav">
        <ul>{items}</ul>
      </div>
    );
  }
}

class Content extends Component {
  constructor(props) {
    super(props);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove  = this.handleTouchMove.bind(this);
  }

  componentDidMount() {
    document.addEventListener('touchstart', this.handleTouchStart, false);
    document.addEventListener('touchmove',  this.handleTouchMove, false);
  }

  componentWillUnmount() {
    document.removeEventListener('touchstart', this.handleTouchStart);
    document.removeEventListener('touchmove',  this.handleTouchMove);
  }

  handleTouchStart(e) {
    this.x = e.touches[0].clientX;
    this.y = e.touches[0].clientY;
  }

  handleTouchMove(e) {
    if (!this.x || !this.y) return;
    var x = this.x - e.touches[0].clientX,
        y = this.y - e.touches[0].clientY,
        c = Object.keys(this.props.data).indexOf(this.props.section);
    if (Math.abs(x) > Math.abs(y)*3) {
      if (x < 0) {
        // right swipe
        c = Math.max(c-1,0);
      } else {
        // left swipe
        c = Math.min(c+1,Object.keys(this.props.data).length-1);
      }
      this.props.navigate(Object.keys(this.props.data)[c]);
    }
  }

  render() {
    const factory = {
      "Bio":        <Bio data={this.props.data["Bio"]}/>,
      "Education":  <Education data={this.props.data["Education"]}/>,
      "Experience": <Experience data={this.props.data["Experience"]}/>,
      "Skills":     <Skills data={this.props.data["Skills"]}/>,
      "Projects":   <Projects data={this.props.data["Projects"]}/>,
    },
    order = Object.keys(this.props.data);
    function content(section) {
      return (
        <div className={"content " + section.toLowerCase()}>
          {factory[section]}
        </div>
      );
    }
    
    return (
      <div id="content">
        <Carousel
          face={order.indexOf(this.props.section)}
          faces={order.map(content)}
        />
      </div>
    );
  }
}

class Bio extends Component {
  render() {
    return (
        <div className="one">
          <div className="half">
            {this.props.data.paragraphs.map((text) => {
                return (<p key={getKey()}>{text}</p>);
            })}
          </div>
          <div className="half center">
              <img src={images['photo.png']} alt="Chris Huber-Lantz"/>
              <p className="email">
                <span>Contact me: </span><span>{this.props.data.email}</span><span>{this.props.data.email_domain}</span>
              </p>
              <div className="btn">
                <a href={this.props.data.resume_href}> {this.props.data.resume_label} </a>
              </div>
          </div>
        </div>
    );
  }
}

class Education extends Component {
  render() {
    return (
      <div className="one">
        <div className="half">
          {this.props.data.schools.map((props) => {
            return (
              <div className="school" key={getKey()}>
                <h3>{props.title} ({props.date})</h3>
                <ul>{props.bullets.map((bullet) => {
                  return <li key={getKey()}>{bullet}</li>;
                })}</ul>
              </div>
            );
          })}
        </div>
        <div className="half hide-phone">
          <div className="inner-panel white">
            <img src={images['csumb.png']} alt="California State University: Monterey Bay"/>
            <img src={images['cabrillo.png']} alt="Cabrillo Community College"/>
            <img src={images['ucsc.jpg']} alt="University of California: Santa Cruz"/>
          </div>
        </div>
      </div>
    );
  }
}

class Experience extends Component {
  render() {
    function format(bullet) {
      console.log(bullet);
      if (typeof(bullet)==="string") return bullet;
      return <a href={bullet.href}>{bullet.label}</a>;
    }
    return (
      <div className="one">
        {this.props.data.jobs.map((props) => {
          return (
            <div className="job half" key={getKey()}>
              <h3>{props.title} @ {props.company}</h3>
              <h3><span>{props.date_end ? props.date_start + " - " + props.date_end : props.date_start}</span></h3>
              {props.bullets.map((bullet) => {
                return <p key={getKey()}>{format(bullet)}</p>;
              })}
            </div>
          );
        })} 
      </div>
    );
  }
}

class Skills extends Component {
  render() {
    return (
      <div className="one">
        <div className="half">
          {this.props.data.categories.map((props) => {
            return (
              <div className="category" key={getKey()}>
                <h2>{props.title}</h2>
                <ul>{props.skills.map((props) => {
                  return <li key={getKey()}>{props}</li>;
                })}</ul>
              </div>
            );
          })}
        </div>
        <div className="half hide-phone">
          <div className="inner-panel white">
             <div className="half">
               <img src={images['jquery.gif']} alt="jquery logo"/>
               <img src={images['django.gif']} alt="django logo"/>
               <img src={images['python.png']} alt="python logo"/>
               <img src={images['react.png']} alt="react logo"/>
               <img src={images['nagios.png']} alt="nagios logo"/>
               <img src={images['perl.png']} alt="perl logo"/>
             </div>
             <div className="half">
               <img src={images['apache.png']} alt="apache logo"/>
               <img src={images['nginx.jpg']} alt="nginx logo"/>
               <img src={images['php_mysql.png']} alt="php mysql logo"/>
               <img src={images['redis.png']} alt="redis logo"/>
             </div>
          </div>
        </div>
      </div>
    );
  }
}

class Projects extends Component {
  render() {
    return (
      <div className="one">
        {this.props.data.map((props) => {
          function patent() {
            if (props.patent_href) return <a href={props.patent_href}>{props.patent_label}</a>;
          }
          return (
            <div className="project half" key={getKey()}>
              <h2>{props.title}</h2>
              <p>{props.one_liner}</p>
              <p>{props.desc} {patent()}</p>
              <ul>{props.technologies.map((props) => {
                return <li key={getKey()}>{props}</li>;
              })}</ul>
            </div>
          );
        })}
      </div>
    );
  }
}

class Footer extends Component {
  render() {
    const content = (<div className="footer-content"> {this.props.data.copyright} </div>);
    return (
      <div className="footer">
          {content}
      </div>
    );
  }
}

export default App;
