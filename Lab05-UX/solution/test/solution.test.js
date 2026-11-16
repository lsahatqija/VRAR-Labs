import { test } from 'node:test';
import assert from 'node:assert/strict';
import { feedbackFor } from '../src/ux/student-feedback.js';
import { afterTransition } from '../src/ux/student-recovery.js';

test('selected feedback has priority and is stronger than hover',()=>{const idle=feedbackFor('idle'),hover=feedbackFor('hover'),selected=feedbackFor('selected');assert.ok(selected.scale>hover.scale&&hover.scale>idle.scale);assert.notEqual(selected.emissive,hover.emissive);});
test('leaving teleport clears preview and destination once',()=>{let clears=0;const marker={visible:true};afterTransition('teleport','browsing',{marker,panel:{userData:{hide(){}}},clearDestination:()=>clears++,clearHover(){},clearSelection(){}});assert.equal(marker.visible,false);assert.equal(clears,1);});
test('leaving information hides panel and clears selection',()=>{let hidden=0,selectionClears=0;afterTransition('information','browsing',{marker:{},panel:{userData:{hide:()=>hidden++}},clearDestination(){},clearHover(){},clearSelection:()=>selectionClears++});assert.equal(hidden,1);assert.equal(selectionClears,1);});
