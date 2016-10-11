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
  stats: JSON.parse(localStorage.getItem('stats')) || {},
  recentButtonClickColours: []
}

const event$ = Bacon.Bus()
const userClick$ = event$.filter(e => e.type === 'userClick')
const buttonClick$ = event$.filter(e => e.type === 'buttonClick')
const statClick$ = event$.filter(e => e.type === 'statClick')
const buttonClickReset$ = buttonClick$.debounce(3000).map(null)

const recentButtonClicksP = buttonClick$.merge(buttonClickReset$)
  .scan([], (acc, x) => x ? R.append(x, acc) : [])

const recentButtonClicks$ = recentButtonClicksP.sampledBy(buttonClick$.merge(buttonClickReset$))

const pushButtonClick = colour => event$.push({ type: 'buttonClick', value: colour })
const userClick = user => event$.push({ type: 'userClick', value: user })
const statClick = (user, colour) => event$.push({ type: 'statClick', value: { user, colour } })

const state$ = Bacon.update(initialState,

  userClick$, (state, c) => R.assoc('selectedUser', c.value, state),

  buttonClick$, (unpatchedState, c) => {
    const user = unpatchedState.selectedUser
    const colour = c.value
    const state = unpatchedState.stats[user] === undefined
      ? R.assocPath(['stats', user], defaultValues, unpatchedState)
      : unpatchedState
    return R.over(R.lensPath(['stats', user, colour]), R.inc, state)
  },

  statClick$, (state, c) => R.over(R.lensPath(['stats', c.value.user, c.value.colour]), R.dec, state),

  recentButtonClicks$, (state, recentButtonClicks) => {
    return R.assoc('recentButtonClickColours', R.pluck('value', recentButtonClicks), state)
  }
)

state$.map('.stats').skipDuplicates().onValue(s => localStorage.setItem('stats', JSON.stringify(s)))

const Button = props => {
  const spacing = 16
  const width = Math.floor((window.innerWidth-6*spacing)/5)
  const height = width
  const style = { width, height }
  return (
    <div
      style={style}
      className={ 'button ' + props.colour }
      onClick={() => props.onClick(props.colour)}>
      {props.count}
    </div>
  )
}

const Stat = props =>
  <div className={ 'stat ' + props.colour } onClick={props.onClick}>{props.number}</div>

const User = React.createClass({
  render: function() {
    const userClasses = 'user ' + (this.props.selected ? 'selected' : '')
    const stats = this.props.stats || {}
    const total = R.sum(R.values(stats))
    const toStatElement = c => {
      return (stats[c] === undefined || stats[c] === 0)
      ? undefined
      : <Stat key={c} colour={c} number={stats[c]} onClick={() => statClick(this.props.user, c)}/>
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
    const onJoinClick = () => {
      const dirty = window.prompt("Please enter your name") || ''
      const name = dirty.trim()
      const href = window.location.href
      const nextHref = name === '' ? href : href + ',' + name
      window.location = nextHref
    }
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
                onStatClick={statClick}
              />,
              sortedUsers
            )
          }
          <section className="join" onClick={onJoinClick}
          >+</section>
        </section>
        <section className="buttons">
          {
            R.map(c =>
              <Button
                key={c}
                colour={c}
                onClick={pushButtonClick}
                count={ R.countBy(R.identity, this.state.recentButtonClickColours)[c] }
              />,
              colours
            )
          }
        </section>
      </section>
    )
  }
})

ReactDOM.render(<Lihamuki users={users}/>, document.getElementById('content'))
