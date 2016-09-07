const getQueryParam = name => {
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(window.location.href);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

const capitalize = string => string.charAt(0).toUpperCase() + string.substring(1)

const users = (getQueryParam('users') || 'somebody').split(',')
const colours = ['green', 'blue', 'yellow', 'red', 'raw']
const defaultValues = R.fromPairs(R.map(c => [c, 0], colours))

const initialState = {
  selectedUser: users[0],
  stats: JSON.parse(localStorage.getItem('stats')) || {}
}

const event$ = Bacon.Bus()
const userClick$ = event$.filter(e => e.type === 'userClick')
const buttonClick$ = event$.filter(e => e.type === 'buttonClick')

const pushButtonClick = colour => event$.push({ type: 'buttonClick', value: colour })
const userClick = user => event$.push({ type: 'userClick', value: user })

const state$ = Bacon.update(initialState,
  userClick$, (state, c) => R.assoc('selectedUser', c.value, state),
  buttonClick$, (unpatchedState, c) => {
    const user = unpatchedState.selectedUser
    const colour = c.value
    const state = unpatchedState.stats[user] === undefined
      ? R.assocPath(['stats', user], defaultValues, unpatchedState)
      : unpatchedState
    return R.over(R.lensPath(['stats', user, colour]), R.inc, state)
  }
)

state$.map('.stats').skipDuplicates().onValue(s => localStorage.setItem('stats', JSON.stringify(s)))

const Button = props =>
  <div className={ 'button ' + props.colour } onClick={() => props.onClick(props.colour)}/>

const Stat = props =>
  <div className={ 'stat ' + props.colour }>{props.number}</div>

const User = React.createClass({
  render: function() {
    const userClasses = 'user ' + (this.props.selected ? 'selected' : '')
    const stats = this.props.stats || {}
    const total = R.sum(R.values(stats))
    const toStatElement = c => {
      return (stats[c] === undefined || stats[c] === 0)
      ? undefined
      : <Stat key={c} colour={c} number={stats[c]}/>
    }
    const statElements = R.map(toStatElement, colours)
    const statElementsWithTotal = total !== 0
      ? R.append((<Stat key='total' colour='total' number={total}/>), statElements)
      : statElements
    return (
      <div className={userClasses} onClick={() => this.props.onClick(this.props.user)}>
        <div className='name'>{capitalize(this.props.user)}</div>
        <div className='stats'>
          { statElementsWithTotal }
        </div>
      </div>
    )
  }
})

const totalByUser = (stats, user) => R.sum(R.values(stats[user]))

const Lihamuki = React.createClass({
  getInitialState: function() {
    return initialState
  },
  componentDidMount: function() {
    state$.onValue(nextState => this.setState(nextState))
  },
  render: function() {
    const sortedUsers = R.sortBy(u => -totalByUser(this.state.stats, u), this.props.users)
    return (
      <section className="content">
        <section className="users">
          {
            R.map(u =>
              <User
                key={u}
                user={u}
                selected={u === this.state.selectedUser}
                stats={this.state.stats[u]}
                onClick={userClick}
              />,
              sortedUsers
            )
          }
        </section>
        <section className="buttons">
          {
            R.map(c =>
              <Button key={c} colour={c} onClick={pushButtonClick} />,
              colours
            )
          }
        </section>
      </section>
    )
  }
})

ReactDOM.render(<Lihamuki users={users}/>, document.getElementById('content'))
