/*
  Copyright (c) Microsoft Corporation.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

import type { Stats } from './types';
import * as React from 'react';
import './colors.css';
import './common.css';
import './headerView.css';
import * as icons from './icons';
import { Link, navigate, SearchParamsContext } from './links';
import { statusIcon } from './statusIcon';
import { filterWithQuery } from './filter';
import { linkifyText } from '@web/renderUtils';

export const HeaderView: React.FC<{
  title: string | undefined,
  leftSuperHeader?: React.ReactNode,
  rightSuperHeader?: React.ReactNode,
}> = ({ title, leftSuperHeader, rightSuperHeader }) => {
  return <div className='header-view'>
    <div className='hbox header-superheader'>
      {leftSuperHeader}
      <div style={{ flex: 'auto' }}></div>
      {rightSuperHeader}
    </div>
    {title && <div className='header-title'>{linkifyText(title)}</div>}
  </div>;
};

export const GlobalFilterView: React.FC<{
  stats: Stats,
  filterText: string,
  setFilterText: (filterText: string) => void,
}> = ({ stats, filterText, setFilterText }) => {
  const searchParams = React.useContext(SearchParamsContext);
  React.useEffect(() => {
    // Add an extra space such that users can easily add to query
    const query = searchParams.get('q');
    setFilterText(query ? `${query.trim()} ` : '');
  }, [searchParams, setFilterText]);

  return (<>
    <div className='pt-3'>
      <div className='header-view-status-container ml-2 pl-2 d-flex'>
        <StatsNavView stats={stats}></StatsNavView>
      </div>
      <form className='subnav-search' onSubmit={
        event => {
          event.preventDefault();
          const url = new URL(window.location.href);
          // If <form/> onSubmit happens immediately after <input/> onChange, the filterText state is not updated yet.
          // Using FormData here is a workaround to get the latest value.
          const q = new FormData(event.target as HTMLFormElement).get('q') as string;
          url.hash = q ? '?' + new URLSearchParams({ q }) : '';
          navigate(url);
        }
      }>
        {icons.search()}
        {/* Use navigationId to reset defaultValue */}
        <input name='q' spellCheck={false} className='form-control subnav-search-input input-contrast width-full' value={filterText} onChange={e => {
          setFilterText(e.target.value);
        }}></input>
      </form>
    </div>
  </>);
};

const StatsNavView: React.FC<{
  stats: Stats
}> = ({ stats }) => {
  return <nav>
    <Link className='subnav-item' href='#?'>
      <span className='subnav-item-label'>All</span>
      <span className='d-inline counter'>{stats.total - stats.skipped}</span>
    </Link>
    <NavLink token='passed' count={stats.expected} />
    <NavLink token='failed' count={stats.unexpected} />
    <NavLink token='flaky' count={stats.flaky} />
    <NavLink token='skipped' count={stats.skipped} />
  </nav>;
};

const NavLink: React.FC<{
  token: string,
  count: number,
}> = ({ token, count }) => {
  const searchParams = React.useContext(SearchParamsContext);
  const q = searchParams.get('q')?.toString() || '';
  const queryToken = `s:${token}`;

  const clickUrl = filterWithQuery(q, queryToken, false);
  const ctrlClickUrl = filterWithQuery(q, queryToken, true);

  const label = token.charAt(0).toUpperCase() + token.slice(1);

  return <Link className='subnav-item' href={clickUrl} click={clickUrl} ctrlClick={ctrlClickUrl}>
    {count > 0 && statusIcon(token as any)}
    <span className='subnav-item-label'>{label}</span>
    <span className='d-inline counter'>{count}</span>
  </Link>;
};
