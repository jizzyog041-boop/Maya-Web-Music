const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const audio=$("#audio");
const MUSIC_API="https://api.freetouse.com/v3";
const saved=key=>{try{return JSON.parse(localStorage.getItem(key)||"[]")}catch{return []}};
const state={songs:[],queue:[],index:-1,liked:new Set(saved("maya-liked")),playlists:saved("maya-playlists"),page:"home",shuffle:false,repeat:false,search:"",busy:false,source:"freetouse"};
const samples=[
 {id:"demo1",title:"Night Drive (Demo)",artist:"Maya Demo",url:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",source:"demo"},
 {id:"demo2",title:"Midnight Echoes (Demo)",artist:"Maya Demo",url:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",source:"demo"},
 {id:"demo3",title:"Silver Skies (Demo)",artist:"Maya Demo",url:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",source:"demo"}
];
state.songs=[...samples];
function persist(){localStorage.setItem("maya-liked",JSON.stringify([...state.liked]));localStorage.setItem("maya-playlists",JSON.stringify(state.playlists))}
function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove("show"),2800)}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function cover(song,mini=false){return `<div class="cover ${mini?"mini":""}" ${song?.cover?`style="background-image:url('${esc(song.cover)}')"`:""}>${song?.cover?"":"♫"}</div>`}
function card(song,i){return `<article class="music-card" data-play="${i}">${cover(song)}<h3>${esc(song.title)}</h3><p>${esc(song.artist||"Unknown artist")}</p><button class="row-action" data-play="${i}">▶ Play</button></article>`}
function songRows(songs){if(!songs.length)return `<div class="empty">No tracks found. Search online or try another term.</div>`;return `<table class="song-table"><thead><tr><th>#</th><th>TITLE</th><th>ARTIST</th><th></th><th></th></tr></thead><tbody>${songs.map((s,n)=>{let i=state.songs.findIndex(x=>x.id===s.id);return `<tr><td>${String(n+1).padStart(2,"0")}</td><td><div class="song-name"><div class="table-cover">${s.cover?`<img src="${esc(s.cover)}" style="width:100%;height:100%;object-fit:cover">`:"♫"}</div><div><b>${esc(s.title)}</b><div class="muted">${esc(s.source==="freetouse"?"Free To Use catalogue":s.source==="upload"?"Your upload":"Demo track")}</div></div></td><td>${esc(s.artist||"Unknown artist")}</td><td><button class="row-action" data-like="${i}" title="Like">${state.liked.has(s.id)?"♥":"♡"}</button></td><td><button class="row-action" data-play="${i}" title="Play">▶</button></td></tr>`}).join("")}</tbody></table>`}
function heading(title,sub=""){return `<h1 class="page-title">${title}</h1>${sub?`<p class="page-sub">${sub}</p>`:""}`}
function render(){
 const v=$("#view");
 if(state.page==="home"){
  const online=state.songs.filter(s=>s.source==="freetouse");
  v.innerHTML=`<div class="hero"><span class="eyebrow">MAYA MUSIC • ONLINE CATALOGUE</span><h1>Feel every<br>frequency.</h1><p>Search independent music, press play, and take your sound with you.</p><div><button class="primary" id="play-featured">▶ &nbsp; Play Maya Mix</button> <button class="secondary" data-page="search">Search live music</button></div></div><div class="section-head"><h2>${online.length?"Online catalogue":"Explore music"}</h2><button class="text-btn" data-page="search">SEARCH ONLINE</button></div><div class="cards">${(online.length?online:state.songs.slice(0,5)).slice(0,5).map(s=>card(s,state.songs.indexOf(s))).join("")}</div><p class="footer-note">Catalogue powered by Jamendo. Track availability and permitted use follow each track’s licence. Search to load current online results.</p>`;
 } else if(state.page==="search"){
  v.innerHTML=`${heading("Search","Discover music from Jamendo, or open matching results in Spotify.")}<div class="search-box"><input id="search-input" placeholder="Search songs, artists or genres…" value="${esc(state.search)}"><button id="search-go" class="primary">Search Jamendo</button><button id="spotify-search" class="secondary">Search Spotify ↗</button></div><div class="section-head"><h2 id="results-title">Online results</h2><span class="muted" id="results-status">Search for a track or artist</span></div><div id="search-results" class="results-list">${songRows(state.songs.filter(s=>s.source==="freetouse"))}</div><p class="footer-note">Maya uses Free To Use API for royalty-free music. This is not a catalogue of every commercial Spotify/film song.</p>`;
 } else if(state.page==="library"){
  v.innerHTML=`${heading("Your Library","Liked tracks and playlists are saved in this browser.")}<div class="section-head"><h2>All loaded tracks</h2><span class="muted">${state.songs.length} tracks</span></div>${songRows(state.songs)}<div class="section-head"><h2>Liked songs</h2></div>${songRows(state.songs.filter(s=>state.liked.has(s.id)))}`;
 } else if(state.page==="upload"){
  v.innerHTML=`${heading("Upload Music","Play audio files stored on your device.")}<div class="upload-box"><div class="upload-icon">⇧</div><h2>Bring your sound to Maya</h2><p>Choose audio files. They play locally and are not uploaded to a server.</p><input id="file-input" type="file" accept="audio/*,.mp3,.wav,.m4a,.ogg,.flac" multiple><div><button class="primary" id="upload-btn">Add selected tracks</button></div><p class="muted">Only upload music you own or have permission to use.</p></div>`;
 } else if(state.page==="settings"){
  v.innerHTML=`${heading("Settings","Configure the online music catalogue.")}<div class="settings-list"><div class="setting"><div><b>Music provider</b><small>Free To Use royalty-free catalogue</small></div><span>Online</span></div><div class="setting"><div><b>Jamendo client ID</b><small>Get your own ID from developer.jamendo.com</small></div><input id="client-id" value="${esc(state.clientId)}" aria-label="Jamendo client ID" style="max-width:180px"></div><div class="setting"><div><b>Save provider ID</b><small>Client ID is public; never put secret keys in frontend code</small></div><button id="save-client" class="secondary">Save</button></div><div class="setting"><div><b>Background playback</b><small>Media controls are enabled where the browser supports them</small></div><span>Enabled</span></div><div class="setting"><div><b>Appearance</b><small>Minimal monochrome dark theme</small></div><span>Black & White ✓</span></div></div><p class="footer-note">Developed by <b>Dhanush</b>. Free To Use catalogue terms and each track’s licence apply. Commercial use may require a paid licence.</p>`;
 } else if(state.page==="playlist"){
  const p=state.playlists.find(x=>x.id===state.activePlaylist);v.innerHTML=`${heading(esc(p?.name||"Playlist"),"Your personal collection.")}<div class="section-head"><h2>Playlist tracks</h2><button class="secondary" id="add-to-playlist">Add songs</button></div>${songRows((p?.ids||[]).map(id=>state.songs.find(s=>s.id===id)).filter(Boolean))}`;
 }
 $("#playlist-list").innerHTML=state.playlists.map(p=>`<button class="playlist-link" data-playlist="${esc(p.id)}">♫ &nbsp; ${esc(p.name)}</button>`).join("")||`<span class="muted" style="font-size:11px;padding:7px">Create your first playlist</span>`;
 bindView();
}
function bindView(){
 $$("[data-page]").forEach(b=>b.onclick=()=>{state.page=b.dataset.page;render()});
 $$("[data-play]").forEach(b=>b.onclick=()=>playIndex(Number(b.dataset.play)));
 $$("[data-like]").forEach(b=>b.onclick=()=>{const s=state.songs[Number(b.dataset.like)];if(!s)return;state.liked.has(s.id)?state.liked.delete(s.id):state.liked.add(s.id);persist();render()});
 $$("[data-playlist]").forEach(b=>b.onclick=()=>{state.activePlaylist=b.dataset.playlist;state.page="playlist";render()});
 const search=$("#search-input");
 if(search){const doSearch=()=>searchOnline(search.value.trim());$("#search-go").onclick=doSearch;$("#spotify-search").onclick=()=>{const q=search.value.trim();if(!q){toast("Enter a song or artist first.");return}window.open("https://open.spotify.com/search/"+encodeURIComponent(q),"_blank","noopener,noreferrer")};search.onkeydown=e=>{if(e.key==="Enter")doSearch()}}
 if($("#play-featured"))$("#play-featured").onclick=()=>{const i=state.songs.findIndex(s=>s.source==="freetouse");playIndex(i>=0?i:0)};
 if($("#upload-btn"))$("#upload-btn").onclick=uploadFiles;
 if($("#new-playlist"))$("#new-playlist").onclick=createPlaylist;
 if($("#add-to-playlist"))$("#add-to-playlist").onclick=addToPlaylist;
}
async function searchOnline(q){
 state.search=q;const status=$("#results-status"),results=$("#search-results"),title=$("#results-title");
 if(!q){if(status)status.textContent="Enter a song, artist or genre";return}
 if(!results)return;
 results.innerHTML=`<div class="empty">Searching the online catalogue…</div>`;if(status)status.textContent="Connecting to Free To Use…";if(title)title.textContent="Search results";
 try{
  const url=new URL(MUSIC_API+"/music/tracks/search");
  url.search=new URLSearchParams({query:q,limit:"25",order:"views",sort:"desc"}).toString();
  const res=await fetch(url);if(!res.ok)throw new Error("Music API response "+res.status);
  const data=await res.json();
  const raw=Array.isArray(data)?data:(data.tracks||data.results||data.data||[]);
  const tracks=raw.map(t=>({
    id:"freetouse-"+(t.id||t.slug||t.title||Math.random()),
    title:t.title||t.name||"Untitled track",
    artist:t.artist||t.artist_name||t.creator||"Unknown artist",
    url:t.audio_url||t.stream_url||t.audio||t.url||t.file_url||t.mp3_url||"",
    cover:t.artwork_url||t.cover_url||t.image_url||t.thumbnail||t.artwork||"",
    source:"freetouse",
    license:t.license||t.license_name||"Free To Use License",
    licenseUrl:t.license_url||t.licenseUrl||"https://freetouse.com/license"
  })).filter(t=>t.url&&/^https?:/i.test(t.url));
  if(!tracks.length){results.innerHTML=`<div class="empty">No playable tracks returned. Try another search, or check the provider API availability.</div>`;if(status)status.textContent="No playable results";return}
  state.songs=state.songs.filter(s=>s.source!=="freetouse");state.songs.push(...tracks);
  results.innerHTML=songRows(tracks);if(status)status.textContent=`${tracks.length} online tracks`;bindView();
 }catch(err){results.innerHTML=`<div class="empty">Could not load the online catalogue. Check your internet connection or provider availability.<br><small>${esc(err.message)}</small><br><a href="https://freetouse.com/api" target="_blank" rel="noopener">Open music API docs</a></div>`;if(status)status.textContent="Connection failed"}
}
function playIndex(i){
 const s=state.songs[i];if(!s)return;state.index=i;audio.src=s.url;audio.play().then(()=>toast("Now playing: "+s.title)).catch(()=>toast("Playback unavailable. Try another track or check the connection."));
 state.queue=state.songs.map((_,j)=>j);renderPlayerOnly();if(state.page==="home")render();
 if("mediaSession" in navigator){navigator.mediaSession.metadata=new MediaMetadata({title:s.title,artist:s.artist||"Unknown artist",album:"Maya Music",artwork:s.cover?[{src:s.cover,sizes:"300x300",type:"image/jpeg"}]:[]});navigator.mediaSession.setActionHandler("play",()=>audio.play());navigator.mediaSession.setActionHandler("pause",()=>audio.pause());navigator.mediaSession.setActionHandler("previoustrack",prev);navigator.mediaSession.setActionHandler("nexttrack",next)}
}
function renderPlayerOnly(){const s=state.songs[state.index];if(!s)return;$("#mini-title").textContent=s.title;$("#mini-artist").textContent=s.artist||"Unknown artist";$("#mini-cover").style.backgroundImage=s.cover?`url("${s.cover}")`:"";$("#mini-cover").textContent=s.cover?"":"♫";$("#play").textContent=audio.paused?"▶":"Ⅱ";$("#like-current").textContent=state.liked.has(s.id)?"♥":"♡"}
function next(){if(!state.songs.length)return;let i=state.shuffle?Math.floor(Math.random()*state.songs.length):(state.index+1)%state.songs.length;playIndex(i)}
function prev(){if(audio.currentTime>3){audio.currentTime=0;return}playIndex((state.index-1+state.songs.length)%state.songs.length)}
function fmt(n){if(!Number.isFinite(n))return"0:00";return Math.floor(n/60)+":"+String(Math.floor(n%60)).padStart(2,"0")}
$("#play").onclick=()=>{if(state.index<0){playIndex(0);return}if(audio.paused)audio.play().catch(()=>toast("Could not play this track."));else audio.pause();renderPlayerOnly()};
$("#next").onclick=next;$("#prev").onclick=prev;$("#shuffle").onclick=()=>{state.shuffle=!state.shuffle;$("#shuffle").style.color=state.shuffle?"white":"#aaa";toast(state.shuffle?"Shuffle on":"Shuffle off")};
$("#repeat").onclick=()=>{state.repeat=!state.repeat;audio.loop=state.repeat;$("#repeat").style.color=state.repeat?"white":"#aaa";toast(state.repeat?"Repeat one on":"Repeat off")};
$("#like-current").onclick=()=>{const s=state.songs[state.index];if(!s)return;state.liked.has(s.id)?state.liked.delete(s.id):state.liked.add(s.id);persist();renderPlayerOnly();toast(state.liked.has(s.id)?"Added to liked songs":"Removed from liked songs")};
$("#volume").oninput=e=>audio.volume=Number(e.target.value);
$("#seek").oninput=e=>{if(Number.isFinite(audio.duration))audio.currentTime=audio.duration*Number(e.target.value)/100};
audio.ontimeupdate=()=>{$("#current-time").textContent=fmt(audio.currentTime);$("#duration").textContent=fmt(audio.duration);if(Number.isFinite(audio.duration)&&audio.duration>0)$("#seek").value=audio.currentTime/audio.duration*100};
audio.onplay=renderPlayerOnly;audio.onpause=renderPlayerOnly;audio.onended=()=>{if(!state.repeat)next()};
$("#back").onclick=()=>{state.page="home";render()};$("#forward").onclick=()=>{state.page="library";render()};$("#queue-btn").onclick=()=>{state.page="library";render()};
function uploadFiles(){const files=[...($("#file-input")?.files||[])];if(!files.length){toast("Choose audio files first.");return}for(const f of files){if(!f.type.startsWith("audio/")&&!/\.(mp3|wav|m4a|ogg|flac)$/i.test(f.name))continue;state.songs.push({id:"upload-"+Date.now()+"-"+Math.random(),title:f.name.replace(/\.[^.]+$/,""),artist:"Your upload",url:URL.createObjectURL(f),source:"upload"})}state.page="library";render();toast("Audio added for this browser session.")}
function createPlaylist(){const name=prompt("Playlist name?");if(!name?.trim())return;state.playlists.push({id:String(Date.now()),name:name.trim(),ids:[]});persist();render();toast("Playlist created")}
function addToPlaylist(){const p=state.playlists.find(x=>x.id===state.activePlaylist);if(!p)return;const available=state.songs.filter(s=>!(p.ids||[]).includes(s.id));if(!available.length){toast("No more tracks to add.");return}const chosen=prompt("Enter song number to add:\n"+available.map((s,i)=>`${i+1}. ${s.title}`).join("\n"));const n=Number(chosen)-1;if(available[n]){p.ids=p.ids||[];p.ids.push(available[n].id);persist();render();toast("Song added to playlist")}}
if("serviceWorker" in navigator && location.protocol.startsWith("http"))navigator.serviceWorker.register("./sw.js").catch(()=>{});
render();
