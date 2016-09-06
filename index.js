const Lihamuki = React.createClass({
  getInitialState: function() {
    return {}
  },
  render: function() {
    return (
      <p>Lihamuki React hello</p>
    )
  }
})

ReactDOM.render(
  <Lihamuki />,
  document.getElementById('content')
)
