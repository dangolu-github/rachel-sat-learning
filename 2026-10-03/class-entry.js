'use strict';
const handoutFrame=document.getElementById('handout-page');
const handoutOpen=document.getElementById('handout-open');
const handoutChoices=Array.from(document.querySelectorAll('[data-handout]'));
handoutChoices.forEach(button=>button.addEventListener('click',()=>{
  if(button.getAttribute('aria-pressed')==='true')return;
  handoutChoices.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
  handoutFrame.src=button.dataset.handout;
  handoutFrame.title=button.dataset.title;
  handoutOpen.href=button.dataset.handout;
}));
const homeworkFrame=document.getElementById('homework-page');
const homeworkOpen=document.getElementById('homework-open');
const homeworkCount=document.getElementById('homework-count');
const preview=new URLSearchParams(location.search).get('preview')==='1';
function loadHomework(src){
  const url=new URL(src,location.href);
  if(preview){url.searchParams.set('preview','1');const open=new URL(url);open.searchParams.delete('embed');homeworkOpen.href=open.href;}
  const go=function(){homeworkFrame.src=window.RachelAccess?RachelAccess.withHandoff(url.href):url.href;};
  if(window.RachelAccess)RachelAccess.whenTrusted(go);else go();
}
const homeworkChoices=Array.from(document.querySelectorAll('[data-homework-src]'));
homeworkChoices.forEach(button=>button.addEventListener('click',()=>{
  if(button.getAttribute('aria-pressed')==='true')return;
  homeworkChoices.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
  homeworkFrame.title=button.dataset.title;
  homeworkOpen.href=button.dataset.open;
  homeworkCount.textContent=button.dataset.count;
  loadHomework(button.dataset.homeworkSrc);
}));
loadHomework(homeworkFrame.dataset.src);
