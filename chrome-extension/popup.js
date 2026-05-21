chrome.tabs.query({ active: true, currentWindow: true }, async ([tab]) => {
  const urlEl = document.getElementById('url')
  const contentEl = document.getElementById('content')
  const fullBtn = document.getElementById('full') as HTMLAnchorElement

  if (!tab?.url || tab.url.startsWith('chrome://')) {
    urlEl!.textContent = 'Невозможно сканировать эту страницу'
    contentEl!.innerHTML = '<div class="err">Расширение не работает на chrome:// страницах</div>'
    return
  }

  urlEl!.textContent = tab.url
  fullBtn!.href = `https://zxc-r1spclf9a-bitplugg.vercel.app/tools?report=${btoa(encodeURIComponent(JSON.stringify({ url: tab.url })))}`

    const res = await fetch(`https://zxc-r1spclf9a-bitplugg.vercel.app/api/scan?url=${encodeURIComponent(tab.url)}`)
    const json = await res.json()

    if (!json.success) throw new Error(json.error)

    const d = json.data
    const score = Math.round(d.overallScore / d.maxScore * 100)

    contentEl!.innerHTML = `
      <div class="grade ${d.grade}">${d.grade} <span style="font-size:14px;font-weight:400">${score}%</span></div>
      <div class="row"><span class="name">Status</span><span class="val">${d.status}</span></div>
      ${d.headers.filter((h: any) => h.value).map((h: any) => `
        <div class="row">
          <span class="name">${h.displayName}</span>
          <span class="val" title="${h.value.replace(/"/g, '&quot;')}">${h.value.substring(0, 40)}${h.value.length > 40 ? '…' : ''}</span>
        </div>
      `).join('')}
    `
  } catch (err) {
    contentEl!.innerHTML = `<div class="err">${err instanceof Error ? err.message : 'Ошибка сканирования'}</div>`
  }
})
