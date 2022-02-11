import React from 'react';
import { NextPage, GetStaticProps } from 'next';
import 'data/adapters';
import sdk from 'data/sdk';
import SocialTags from 'components/SocialTags';
import ToggleBar from 'components/ToggleBar';
import L1List from 'components/L1List';
import L1Chart from 'components/L1Chart';

interface HomeProps {
  timeData: any[];
  dataWithMetadata: any[];
}

export const Home: NextPage<HomeProps> = ({ timeData, dataWithMetadata }) => {
  return (
    <main>
      <SocialTags />

      <h1 className="title">L2 Fees</h1>

      <p className="description">How much are rollups paying for Ethereum&apos;s security?</p>

      <p className="heart">
        <a href="https://cryptofees.info">CryptoFees.info</a>
        {' + '}
        <a href="https://l2beat.com">L2Beat.com</a>
        {' = ❤️'}
      </p>

      <ToggleBar
        options={[
          { path: '/', label: 'L2 Transaction Fees' },
          { path: '/l1-fees', label: 'Total L1 Security Costs' },
        ]}
      />

      <L1List data={dataWithMetadata} />

      <div className="chart-container">
        <L1Chart data={timeData} />
      </div>

      <style jsx>{`
        main {
          padding: 2rem 0 3rem;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          width: 100%;
        }

        .title {
          margin: 0 0 16px;
          line-height: 1.15;
          font-size: 4rem;
          font-weight: 700;
        }

        .title,
        .description {
          text-align: center;
          max-width: 800px;
        }

        .description {
          line-height: 1.5;
          font-size: 1.5rem;
          margin: 4px 0 20px;
        }

        .heart {
          margin: 0 0 18px 0;
          font-size: 18px;
          font-style: italic;
        }

        .chart-container {
          width: 100%;
          max-width: 800px;
          margin: 10px 0;
        }
      `}</style>
    </main>
  );
};

const NUM_DAYS = 16;

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const list = sdk.getCollection('rollup-l1-fees');
  await list.fetchAdapters();
  await list.fetchAdapterFromIPFS('QmU5daDDW4D9Wv8G9ak21kZhSQDEuiuUcHVutpcqHEQXoz');

  const dates: string[] = [];
  const yesterday = sdk.date.getYesterdayDate();
  for (let i = 0; i <= NUM_DAYS; i += 1) {
    dates.push(sdk.date.offsetDaysFormatted(yesterday, i - NUM_DAYS));
  }

  let timeData = await Promise.all(
    dates.map(async (date: string) => ({
      date,
      result: await list.executeQuery('oneDayFeesPaidUSD', date),
    }))
  );

  timeData = timeData.map((oneDay) => ({
    date: oneDay.date,
    ...oneDay.result.reduce((map: any, result) => {
      map[result.id] = result.result || 0;
      return map;
    }, {}),
  }));

  const dataWithMetadata = await list.executeQueryWithMetadata('oneDayFeesPaidUSD', yesterday);

  return { props: { timeData, dataWithMetadata }, revalidate: 15 * 60 };
};

export default Home;