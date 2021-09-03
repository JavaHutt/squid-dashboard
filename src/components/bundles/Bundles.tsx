import { useState, useEffect } from 'react';
import Highlighter from 'react-highlight-words';
import { Typography, Table, Input, Space, Button, notification } from 'antd';
import { ColumnsType, ColumnType } from 'antd/es/table';
import { SearchOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import styles from './Bundles.module.scss';
import BundlesBar from './BundlesBar';
import BundlesActions from './BundlesActions';
import ChangeDefaultPrice from '../modals/ChangeDefaultPrice';
import Bundle from '../../models/bundle';
import CountryPrices from './CountryPrices';
import useTypedSelector from '../../hooks/useTypedSelector';
import useActions from '../../hooks/useActions';

const { Title, Text } = Typography;

const Bundles: React.FC = () => {
    const { bundles, error: errorLoadingBundles } = useTypedSelector(state => state.bundle);
    const { defaultPrice, error: errorLoadingDefaultPrice } = useTypedSelector(state => state.defaultPrice);
    const { fetchBundles, addBundle, deleteBundle, fetchDefaultPrice, changeDefaultPrice } = useActions();

    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const [showChangeDefaultPriceModal, setShowChangeDefaultPriceModal] = useState(false);

    let searchInput: Input | null;
    const pageSize = 15;

    const handleSearch = (selectedKeys: React.Key[], confirm: () => void, dataIndex: string) => {
        confirm();
        setSearchText(selectedKeys[0].toString());
        setSearchedColumn(dataIndex);
    };

    const handleReset = (clearFilters: () => void) => {
        clearFilters();
        setSearchText('');
    };

    const getColumnSearchProps: (dataIndex: string) => ColumnType<Bundle> = dataIndex => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }}>
                <Input
                    ref={node => {
                        searchInput = node;
                    }}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{ marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Search
                    </Button>
                    <Button onClick={() => handleReset(clearFilters!)} size="small" style={{ width: 90 }}>
                        Reset
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            confirm({ closeDropdown: false });
                            setSearchText(selectedKeys[0] ? selectedKeys[0].toString() : '');
                            setSearchedColumn(dataIndex);
                        }}
                    >
                        Filter
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
        onFilterDropdownVisibleChange: visible => {
            if (visible) {
                setTimeout(() => searchInput!.select(), 100);
            }
        },
        render: (text: string) => searchedColumn === dataIndex ? (
            <Highlighter
                highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                searchWords={[searchText]}
                autoEscape
                textToHighlight={text || ''}
            />
        ) : (
            text
        ),
    });

    const rowExpandable = (record: Bundle) => record.price_for_app_by_country
        ? record.price_for_app_by_country.length > 0
        : false;

    const expandedRowRender = (record: Bundle) => <CountryPrices data={record.price_for_app_by_country!} />;

    const columns: ColumnsType<Bundle> = [
        {
            title: 'Bundle Name',
            dataIndex: 'app_name',
            key: 'bundleName',
            width: '35%',
            onFilter: (value, record) => record.app_name
                ? record.app_name.includes(value.toString().toLowerCase())
                : false,
            ...getColumnSearchProps('app_name'),
        },
        {
            title: 'URL',
            dataIndex: 'app_url',
            key: 'url',
            width: '35%',
            render: text => <a href={text} target="_blank" rel="noreferrer">{text}</a>,
        },
        {
            title: 'Price',
            dataIndex: 'price_for_app',
            key: 'priceForApp',
            width: '20%',
            sorter: (a, b) => a.price_for_app! - b.price_for_app!,
        },
        {
            title: 'Action',
            key: 'action',
            width: '10%',
            render: record => <BundlesActions bundle={record} deleteBundle={deleteBundle} />,
        },
    ];

    const notifyError = (message: string, description: string) => {
        notification.open({
            message,
            description,
            icon: <ExclamationCircleOutlined style={{ color: '#108ee9' }} />,
        });
    };

    useEffect(() => {
        fetchBundles();
        fetchDefaultPrice();
    }, []);

    // WHY THE FUCK IF I PUT THIS LOGIC INTO ONE USEEFFECT HOOK, IT NOTIFIES 3 TIMES?!
    useEffect(() => {
        if (errorLoadingBundles) notifyError('Error loading bundles', errorLoadingBundles);
    }, [errorLoadingBundles]);

    useEffect(() => {
        if (errorLoadingDefaultPrice) notifyError('Error loading default price', errorLoadingDefaultPrice);
    }, [errorLoadingDefaultPrice]);

    return (
        <>
            <Title level={2}>Third Party Apps</Title>
            {bundles.length > 0 && <BundlesBar bundles={bundles} addBundle={addBundle} />}
            <Table
                rowKey={record => record.id!}
                dataSource={bundles}
                columns={columns}
                pagination={{ pageSize }}
                expandable={{
                    expandedRowRender,
                    rowExpandable,
                }}
            />
            {!errorLoadingDefaultPrice && (
                <Text className={styles.footer}>
                    Note: current default price is {defaultPrice.default_price}&nbsp;
                    <button
                        type="button"
                        className={styles['change-default-price-link']}
                        onClick={() => setShowChangeDefaultPriceModal(true)}
                    >
                        change...
                    </button>
                </Text>
            )}
            <ChangeDefaultPrice
                visible={showChangeDefaultPriceModal}
                setVisible={setShowChangeDefaultPriceModal}
                defaultPrice={defaultPrice}
                changeDefaultPrice={changeDefaultPrice}
            />
        </>
    );
};

export default Bundles;
