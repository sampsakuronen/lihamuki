const event$ = Bacon.Bus()

const Button = React.createClass({
  render: function() {
    return <div className={ 'button ' + this.props.colour }/>
  }
})

const Lihamuki = React.createClass({
  getInitialState: function() {
    return {}
  },
  render: function() {
    return (
      <section>
        <section className="buttons">
          <Button colour='green'/>
          <Button colour='blue'/>
          <Button colour='yellow'/>
          <Button colour='red'/>
          <Button colour='raw'/>
        </section>
      </section>
    )
  }
})

ReactDOM.render(
  <Lihamuki />,
  document.getElementById('content')
)
