import { afterEach, expect, it, vi } from 'vitest';
import { newId } from './id';
afterEach(()=>vi.unstubAllGlobals());
it('creates distinct IDs when randomUUID is unavailable on HTTP',()=>{let counter=0;vi.stubGlobal('crypto',{getRandomValues:(array:Uint32Array)=>{array.set([1,2,3,++counter]);return array;}});expect(newId()).toHaveLength(32);expect(newId()).not.toBe(newId());});
it('still creates IDs if crypto is absent',()=>{vi.stubGlobal('crypto',undefined);expect(newId().length).toBeGreaterThan(10);});
