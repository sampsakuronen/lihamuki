const event$ = Bacon.Bus()

event$.log()

const Button = React.createClass({
  render: function() {
    return <div
      className={ 'button ' + this.props.colour }
      onClick={() => this.props.onClick(this.props.colour)}
    />
  }
})

const Lihamuki = React.createClass({
  getInitialState: function() {
    return {}
  },
  render: function() {
    const pushButtonClick = colour => event$.push({ type: 'buttonClick', value: colour })
    return (
      <section>
        <section className="buttons">
          <Button colour='green' onClick={pushButtonClick} />
          <Button colour='blue' onClick={pushButtonClick} />
          <Button colour='yellow' onClick={pushButtonClick} />
          <Button colour='red' onClick={pushButtonClick} />
          <Button colour='raw' onClick={pushButtonClick} />
        </section>
      </section>
    )
  }
})

ReactDOM.render(
  <Lihamuki />,
  document.getElementById('content')
)
