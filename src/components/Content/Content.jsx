import { Layout } from 'antd'
import React from 'react'

import ListItem from './ItemList/ItemList'

function Contents({ data, isLoading }) {
    const { Content } = Layout
    return (
        <Content>
            <ListItem data={data} isLoading={isLoading} />
        </Content>
    )
}
export default Contents
