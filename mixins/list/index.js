/**
 * @Desc: List Behavior
 * @Author: yanjiao.lu
 * @Date: 2021-12-17 11:07:11
 * @Last Modified by: yanjiao.lu@zhenai.com
 * @Last Modified time: 2021-12-17 11:43:11
 */

/**
 * @param Number size 分页数
 * @param Object params 列表其他请求参数
 * @param Function getListFunc 获取列表数据方法
 * @param Function formatFunc 格式化数据方法
 * @param Function detailParams 查询详情参数
 * @return Behavior
 */
const pageListBehavior = function (
    size = 5,
    params = {},
    getListFunc = null,
    formatFunc = null,
    detailParams = null
) {
    return Behavior({
        properties: {
            size: {
                type: Number,
                value: size,
            },
            getListFunc: {
                type: Function,
                value: getListFunc,
            },
            formatFunc: {
                type: Function,
                value: formatFunc,
            },
            detailParams: {
                type: {},
                value: detailParams,
            },
            params: {
                type: {},
                value: params,
            },
        },

        data: {
            showReachBottom: false, // 是否显示底部正在加载中
            showLoading: false, // 是否正在请求数据列表
            lists: [], // 列表
            seeChannel: false, // 是否有查看文章（如果item内容，需要刷新数据）
            current: 1, // 当前页
            total: 0, // 总量
            currentFollowUp: 0, // 用户当前查看的列表数据
        },

        methods: {
            /**
             * 获取list列表数据
             * @praram Boolean refresh 是否是查看当前的文章（是的话，只用更新当前文章数据）
             */
            getPageData: function (refresh = false) {
                const that = this;
                const lists = that.data.lists;
                const currentFollowUp = that.data.currentFollowUp;
                let params = that.data.params;
                const formatFunc = this.data.formatFunc;

                // refresh 请求第n个用户
                const size = refresh ? 1 : that.data.size;
                let current = refresh ? currentFollowUp + 1 : that.data.current;
                let formatPairList = [];

                if (!this.data.getListFunc) {
                    console.error(
                        `Function Error: getListFunc is not defined in the Component. Please check your code!`
                    );
                }

                if (!refresh) {
                    that.setData({ showLoading: true });
                }

                if (refresh && this.data.detailParams) {
                    params = Object.assign({}, params, this.data.detailParams);
                }

                // 去掉为空的参数
                if (params && typeof params === 'object') {
                    for (let key in params) {
                        if (!params[key]) {
                            delete params[key];
                        }
                    }
                }

                return this.data
                    .getListFunc({
                        size,
                        current,
                        ...params,
                    })
                    .then(({ data }) => {
                        wx.stopPullDownRefresh();
                        wx.hideLoading();

                        if (
                            data &&
                            data.code === 0 &&
                            data.data &&
                            data.data.records
                        ) {
                            formatPairList = data.data.records || [];

                            // 格式化数据
                            if (
                                formatFunc &&
                                typeof formatFunc === 'function'
                            ) {
                                formatPairList = formatPairList.map((res) => {
                                    // return formatFunc(res)
                                    return formatFunc(res, data.data);
                                });
                            }

                            if (refresh) {
                                // 刷新当前进入列表详情页数据
                                that.setData({
                                    [`lists[${currentFollowUp}]`]:
                                        formatPairList[0],
                                });
                            } else {
                                that.setData({
                                    lists:
                                        current > 1
                                            ? lists.concat(formatPairList)
                                            : formatPairList,
                                    showLoading: false,
                                    total: data.data.total,
                                });
                            }
                        } else {
                            // 请求失败继续请求当前页数据
                            that.data.current = current > 0 ? current - 1 : 1;
                            that.setData({
                                showLoading: false,
                            });
                        }
                        that.triggerEvent(
                            'ready',
                            data && data.data ? data.data : ''
                        );
                    });
            },

            /**
             * 跟进页返回列表页回调
             */
            onRefresh: function (e) {
                this.data.seeChannel = true;
                this.data.currentFollowUp = e.currentTarget.dataset.idx;
            },

            /**
             * 立即刷新当前数据
             * @param {Event}} e
             */
            refeshData(e) {
                this.onRefresh(e);
                this.onPageShow();
            },

            /**
             * 查看当前item项
             */
            onItemTap: function (e) {
                const idx = e.currentTarget.dataset.idx;
                const item = this.data.lists[idx];

                this.data.seeChannel = true;
                this.data.currentFollowUp = idx;

                this.triggerEvent('click', { item });
            },

            /**
             * 删除数据项
             * @param {Number} id
             */
            onItemDelete(e) {
                this.setData({
                    [`lists[${this.data.currentFollowUp}].isDel`]: true,
                    total: this.data.total - 1,
                });

                this.triggerEvent('delete', this.data.total - 1);
            },

            /**
             * 页面显示时
             */
            onPageShow: function () {
                if (this.data.seeChannel) {
                    // 阅读文章后，刷新当前数据
                    this.getPageData(true);
                    this.data.seeChannel = false;
                }
            },

            /**
             * 列表请求恢复初始化
             */
            setPageDataToInit: function () {
                // 数据恢复初始化
                this.setData({
                    showReachBottom: false,
                    showLoading: false,
                });
                this.data.seeChannel = false;
                this.data.current = 1;

                this.getPageData();
            },

            /**
             * 获取更多数据，一般用户上滑动到顶部的时候
             */
            getMorePageData: function () {
                const size = this.data.size;
                const total = this.data.total;
                const current = this.data.current;

                if (total >= 0 && current * size >= total) {
                    // 显示已经到底了
                    this.setData({
                        showReachBottom: true,
                        showLoading: false,
                    });
                } else {
                    // 获取下一页数据
                    this.setData({ showLoading: true });
                    this.data.current = current + 1;
                    this.getPageData();
                }
            },
        },
    });
};

module.exports = pageListBehavior;
