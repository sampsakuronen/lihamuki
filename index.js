const Lihamuki = React.createClass({
  getInitialState: function() {
    return {}
  },
  render: function() {
    return (
      <body>
        <section className="buttons">
          <div className="button green"></div>
          <div className="button blue"></div>
          <div className="button yellow"></div>
          <div className="button red"></div>
          <div className="button raw"></div>
        </section>
      </body>
    )
  }
})

ReactDOM.render(
  <Lihamuki />,
  document.getElementById('content')
)
