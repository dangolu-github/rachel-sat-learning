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
const homeworkUrl=new URL(homeworkFrame.dataset.src);
if(new URLSearchParams(location.search).get('preview')==='1'){
  homeworkUrl.searchParams.set('preview','1');
  const previewUrl=new URL(homeworkUrl);previewUrl.searchParams.delete('embed');
  document.getElementById('homework-open').href=previewUrl.href;
}
homeworkFrame.src=homeworkUrl.href;
