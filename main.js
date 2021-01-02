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
  if (x.is_video) {
    x.src = x.video_url
  } else {
    x.src = x.display_resources.pop().src
  }

  return {
    name: x.shortcode,
    src: x.src,
    is_video: x.is_video
  }
}

function for_create(x) {
  x.forEach(x => create(x.name, x.src, x.is_video))
}

function create(name, src, is_video) {
  fetch(src).then(x => x.blob()).then(x => {
    let url = URL.createObjectURL(x)
    let box = document.createElement(is_video ? 'video' : 'img')
    box.src = url
    if (is_video) { box.autoplay = true }
    let ali = document.createElement('a')
    is_video = is_video ? 'mp4' : 'png'
    ali = Object.assign(ali, {
      href: url, target: '_blank', download: `${name}.${is_video}`
    })

    ali.appendChild(box)
    result.appendChild(ali)
  })
}

function for_download(x) {
  x.forEach(x => download(x.name, x.src, x.is_video))
}

function download(name, src, is_video) {
  fetch(src).then(x => x.blob()).then(x => {
    let ali = document.createElement('a')
    let url = URL.createObjectURL(x)
    is_video = is_video ? 'mp4' : 'png'
    ali = Object.assign(ali, { href: url, download: `${name}.${is_video}` })
    ali.click()
    URL.revokeObjectURL(url)
  })
}

function pre_click() {
  return navigator.clipboard.readText().
    then(x => check_json(x)).
    then(x => parse_json(x))
}

btn_paste.addEventListener('click', () => {
  while (result.firstChild) {
    URL.revokeObjectURL(result.firstChild.href)
    result.removeChild(result.firstChild)
  }

  pre_click().then(x => for_create(x))
})

btn_pdown.addEventListener('click', () => {
  pre_click().then(x => for_download(x))
})
