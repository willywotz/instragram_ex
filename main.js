const btn_paste = document.getElementById('btn_paste')
const btn_pdown = document.getElementById('btn_paste_with_download')
const result = document.getElementById('result')

function check_json(x) {
  try { x = new URL('?__a=1', x) }
  catch (e) {
    try { return Promise.resolve(JSON.parse(x)) }
    catch (e) { return Promise.reject(alert(e)) }
  }

  return fetch_json(x)
}

function fetch_json(x) {
  if (x.pathname.length > 15) {
    alert('redirect to copy pure json. please login first.')
    return Promise.reject(window.open(x))
  }

  return fetch(x).then(x => x.json())
}

function parse_json(raw) {
  return Promise.resolve(raw).
    then(x => x.graphql.shortcode_media).
    then(x => {
      if (!x.edge_sidecar_to_children) return [x]
      return x.edge_sidecar_to_children.edges.map(x => x.node)
    }).
    then(x => x.map(x => format_object(x)))
}

function format_object(x) {
  return {
    name: x.shortcode,
    src: x.display_resources.pop().src,
  }
}

function for_create_image(x) {
  x.forEach(x => create_image(x.name, x.src))
}

function create_image(name, src) {
  let img = document.createElement('img')
  img.src = src
  let ali = document.createElement('a')
  ali = Object.assign(ali, { href: src, target: '_blank' })
  ali.appendChild(img)
  result.appendChild(ali)
}

function for_download_image(x) {
  x.forEach(x => download_image(x.name, x.src))
}

function download_image(name, src) {
  fetch(src).then(x => x.blob()).then(x => {
    let ali = document.createElement('a')
    let url = URL.createObjectURL(x)
    ali = Object.assign(ali, { href: url, download: `${name}.png` })
    ali.click()
    URL.revokeObjectURL(url)
  })
}

btn_paste.addEventListener('click', () => {
  while (result.firstChild)
    result.removeChild(result.firstChild)

  navigator.clipboard.readText().
    then(x => check_json(x)).
    then(x => parse_json(x)).
    then(x => for_create_image(x))
})

btn_pdown.addEventListener('click', () => {
  navigator.clipboard.readText().
    then(x => check_json(x)).
    then(x => parse_json(x)).
    then(x => for_download_image(x))
})
