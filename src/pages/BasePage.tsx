import {PureComponent, SyntheticEvent} from "react";
import {getBackendSrv, getDataSourceSrv} from "@grafana/runtime";
import {KubeMeridianDatasource} from "../datasource/datasource";
import store from "../common/store";
import {Node} from "../models/Node";
import {DS_ID, PLUGIN_BASE_URL, ROUTES} from "../constants";
import {hasRole, isLight} from "../common/utils";
import {KubegrafDSOptions, OrgRole} from "../types";
import {SelectableValue} from "@grafana/data";
import {Namespace} from "../models/Namespace";
import {Styles} from "../common/styles";
import {Component} from "../models/Component";
import {Deployment} from "../models/Deployment";
import {Statefulset} from "../models/Statefulset";
import {Daemonset} from "../models/Daemonset";
import {Job} from "../models/Job";
import {CronJob} from "../models/CronJob";
import {Service} from "../models/Service";
import {Pod} from "../models/Pod";

interface Props{
    cluster_id: string
}

export class BasePage extends PureComponent<Props>{

    styles: any;

    pageReady = false;

    cluster_id: string;
    cluster: KubeMeridianDatasource | undefined = undefined;
    promDs: any;
    refreshRate: number = 60 * 1000;

    isAdmin: boolean;

    nodesMap: Node[] = [];
    nodesError: Boolean | Error = false;
    namespacesMap: Namespace[] = [];
    storeComponents: Component[] = [];
    storeDeployments: Deployment[] = [];
    storeStatefulsets: Statefulset[] = [];
    storeDaemonsets: Daemonset[] = [];
    storeJobs: Job[] = [];
    storeCronJobs: CronJob[] = [];
    storeServices: Service[] = [];
    storePods: Pod[] = [];

    componentsError: Boolean | Error = false;
    podsError: Boolean | Error = false;

    constructor(props: any) {
        super(props);
        this.styles = Styles(isLight());
        this.cluster_id = props.cluster_id;

        try{
            this.isAdmin = hasRole(OrgRole.ADMIN);
        }catch (err){
            this.isAdmin = false;
        }
    }

    async getAvailableClusters(){
        let clusters: Array<SelectableValue<string>> = [];
        await getBackendSrv().get('/api/datasources')
            .then(res => {
                clusters = res.filter((item: any) => {
                    return item.type === DS_ID;
                }).map((item: any) => {
                    return {
                        value: item.uid,
                        label: item.name
                    }
                });
            });
        return clusters;
    }

    getValueFromEventItem(eventItem: SyntheticEvent<HTMLInputElement> | SelectableValue<string>){
        if (!eventItem) {
            return '';
        }

        if ('currentTarget' in eventItem) {
            return eventItem.currentTarget.value;
        }

        return (eventItem as SelectableValue<string>).value;
    }

    generateCLusterStatusLink(){
        return `${PLUGIN_BASE_URL}/${ROUTES.ClusterStatus}/${this.props.cluster_id}`;
    }

    generateApplicationsOverviewLink(){
        return `${PLUGIN_BASE_URL}/${ROUTES.ApplicationsOverview}/${this.props.cluster_id}`;
    }

    generateNodesOverviewLink = () => {
        return `${PLUGIN_BASE_URL}/${ROUTES.NodesOverview}/${this.props.cluster_id}`;
    }

    generateEventsLink = () => {
        return `${PLUGIN_BASE_URL}/${ROUTES.Events}/${this.props.cluster_id}`;
    }

    generateLogsLink = () => {
        return `${PLUGIN_BASE_URL}/${ROUTES.Logs}/${this.props.cluster_id}`;
    }

    generateTracesLink = () => {
        return `${PLUGIN_BASE_URL}/${ROUTES.Traces}/${this.props.cluster_id}`;
    }

    generateServicesLink = () => {
        return `${PLUGIN_BASE_URL}/${ROUTES.Services}/${this.props.cluster_id}`;
    }

    generateEditLink = () => {
        return `/connections/datasources/edit/${this.cluster?.instanceSettings.uid}`;
    }

    prepareDs = async () => {
        await this.getCluster();
        const jsonData = this.cluster?.instanceSettings.jsonData as KubegrafDSOptions | undefined;
        // Prefer the UID-based link; fall back to the legacy prometheus_name (a NAME).
        // eslint-disable-next-line @typescript-eslint/no-deprecated -- intentional back-compat read
        const metricsRef = jsonData?.metrics_uid ?? jsonData?.prometheus_name;
        if (metricsRef) {
            this.promDs = await getDataSourceSrv().get(metricsRef).catch(() => undefined);
        }
    }

     getCluster = async () => {
        this.cluster = ( await getDataSourceSrv().get(this.cluster_id).catch(e => undefined) ) as KubeMeridianDatasource | undefined;
        if(
            this.cluster !== undefined
            &&
            this.cluster.instanceSettings.jsonData.refresh_pods_rate !== undefined
        )
            {this.refreshRate = Number(this.cluster.instanceSettings.jsonData.refresh_pods_rate) * 1000;}
    }

    getNodesMap = (_withoutPods = false) => {
        return Promise.all([this.getNodes()]);
    }

    getNamespacesMap = () => {
        if(this.cluster === undefined)
            {return Promise.reject(false);}

        return this.cluster.getNamespaces().then((namespaces: any) => {
            let namespaceStore: any = [];
            let getStore = store.getObject('namespaceStore');
            if (getStore) {
                namespaceStore = getStore;
            }
            namespaces.forEach((namespace: any) => {
                let ns = new Namespace(namespace);
                this.namespacesMap.push(ns);
                let index = namespaceStore.findIndex((item: any) => item.name === ns.name);

                if (index > -1) {
                    ns.open = namespaceStore[index].open;
                } else {
                    namespaceStore.push({ name: ns.name, open: ns.open });
                }
            });
            store.setObject('namespaceStore', namespaceStore);

            let promises: any[] = [];
            promises.push(this.attachDeployments());
            promises.push(this.attachStatefulsets());
            promises.push(this.attachDaemonsets());
            promises.push(this.getCronJobs());
            promises.push(this.getJobs());

            return Promise.all(promises)
                .then(() => {
                    this.attachJobs();
                    this.attachCronJobs();

                    return Promise.all([this.getAllServices(), this.getPods()])
                        .then(() => {
                            this.attachPodsToMap();
                            this.setState({
                                namespacesMap: this.namespacesMap
                            });
                        });
                });
        });
    }

    attachDeployments(){
        return this.cluster?.getDeployments()
            .then((deployments) => {
                deployments.forEach((item: any) => {
                    const deploy = new Deployment(item);
                    this.storeDeployments.push(deploy);
                    let _ns = this.__getNamespace(item.metadata.namespace);
                    if (_ns) { _ns.deployments.push(deploy); }
                });
            })
    }

    attachStatefulsets(){
        return this.cluster?.getStatefulsets()
            .then((statefulsets) => {
                statefulsets.forEach((item: any) => {
                    const statefulSet = new Statefulset(item);
                    this.storeStatefulsets.push(statefulSet);
                    let _ns = this.__getNamespace(item.metadata.namespace);
                    if (_ns) { _ns.statefulsets.push(statefulSet); }
                })
            })
    }

    attachDaemonsets(){
        return this.cluster?.getDaemonsets()
            .then((daemonsets) => {
                daemonsets.forEach((item: any) => {
                    const daemonset = new Daemonset(item);
                    this.storeDaemonsets.push(daemonset);
                    let _ns = this.__getNamespace(item.metadata.namespace);
                    if (_ns) { _ns.daemonsets.push(daemonset); }
                })
            })
    }

    getJobs(){
        return this.cluster?.getJobs()
            .then((jobs) => {
                this.storeJobs = jobs.map((job: any) => new Job(job));
            })
    }

    attachJobs(){
        this.namespacesMap.forEach((ns: Namespace) => {
            const jobsList = this.storeJobs.filter((job: Job) => {
                return !job.data.metadata.ownerReferences?.length && job.data.metadata.namespace === ns.name;
            });

            let nsCrons = this.storeCronJobs.filter((cron: CronJob) => cron.data.metadata.namespace === ns.name);
            nsCrons.forEach((cj: CronJob) => {
                let uid = cj.data.metadata.uid;
                this.storeJobs.filter((_j: Job) => _j.data.metadata.ownerReferences?.length).forEach((job: Job) => {
                    if (job.data.metadata.ownerReferences.filter((item: any) => item.kind === 'CronJob' && item.uid === uid)[0]) {
                        jobsList.push(job);
                    }
                })
            });

            ns.jobs = jobsList;
        });
    }

    attachCronJobs() {
        this.namespacesMap.forEach((ns) => {
            ns.cronjobs = this.storeCronJobs.filter((cron) => cron.data.metadata.namespace === ns.name);

            ns.cronjobs.forEach((cj) => {
                let uid = cj.data.metadata.uid;
                let jobsList: any[] = [];

                this.storeJobs.filter((_j: Job) => _j.data.metadata.ownerReferences?.length).forEach((job) => {
                    if (job.data.metadata.ownerReferences.filter((item: any) => item.kind === 'CronJob' && item.uid === uid)[0]) {
                        jobsList.push(job);
                    }
                });

                cj.jobs = jobsList;
            });
        });
    }

    getCronJobs(){
        return this.cluster?.getCronjobs()
            .then((cronjobs) => {
                this.storeCronJobs = cronjobs.map((cronjob: any) => new CronJob(cronjob));
            })
    }

    getAllServices(){
        return this.cluster?.getServices()
            .then((services) => {
                this.storeServices = services.map((service: any) => new Service(service))
            })
    }

    getNodes(){
        return this.cluster?.getNodes().then((nodes: any) => {
            let nodeStore: any = [];
            let getStore = store.getObject('nodeStore');

            if (getStore) {
                nodeStore = getStore;
            }

            if (nodes instanceof Array) {
                this.nodesError = false;
                nodes.forEach((node: any) => {
                    let nd = new Node(node);
                    this.nodesMap.push(nd);

                    let index = nodeStore.findIndex((item: any) => item.name === nd.name);
                    if (index > -1) {
                        nd.open = nodeStore[index].open;
                    } else {
                        nodeStore.push({ name: nd.name, open: nd.open });
                    }
                });
                store.setObject('nodeStore', nodeStore);
            } else if (nodes instanceof Error) {
                this.nodesError = nodes;
            }
        });
    }

    getPods(skipEmptyHost = false){
        return this.cluster?.getPods()
            .then((pods: any) => {
                if(pods instanceof Array){
                    this.podsError = false;
                    if(skipEmptyHost){
                        pods = pods.filter((pod: any) => pod.status?.hostIP !== undefined);
                    }
                    this.storePods = pods.map((pod: any) => new Pod(pod));
                }else if(pods instanceof Error){
                    this.podsError = pods;
                }
            })
    }

    attachPodsToMap(){
        this.namespacesMap.forEach((ns: Namespace) => {
            ns.deployments.forEach((dep: Deployment) => {
                dep.pods = this.__findPodsBySelector(dep.data.spec.selector.matchLabels, ns.name);
                dep.services = this.__findServices(dep);
            });

            ns.statefulsets.forEach((sts: Statefulset) => {
                sts.pods = this.__findPodsBySelector(sts.data.spec.selector.matchLabels, ns.name);
                sts.services = this.__findServices(sts);
            });

            ns.daemonsets.forEach((ds: Daemonset) => {
                ds.pods = this.__findPodsBySelector(ds.data.spec.selector.matchLabels, ns.name);
                ds.services = this.__findServices(ds);
            });

            ns.jobs.forEach((job: Job) => {
                job.pods = this.__findPodsBySelector(job.data.metadata.labels, ns.name);
            });

            ns.cronjobs.forEach((cron: CronJob) => {
               cron.jobs.map((job: Job) => {
                   job.pods = this.__findPodsBySelector(job.data.metadata.labels, ns.name);
               })
            });

            ns.other[0].pods = this.storePods.filter((pod: Pod) => !pod.used && pod.data.metadata.namespace === ns.name);

        })
    }

    __getNamespace(namespace: string){
        return this.namespacesMap.filter((ns) => {
            return ns.name === namespace;
        })[0];
    }

    __findServices(entity: Deployment|Statefulset|Daemonset) {
        return this.storeServices.filter((item) => {
            if (!item.data.spec || !item.data.spec.selector) {
                return false;
            }
            let matchLabels = item.data.spec.selector;
            let result = this.__findPodsBySelector(matchLabels, item.data.metadata.namespace, entity.pods);
            if (result.length > 0) {
                return true;
            }

            return false;
        });
    }

    __findPodsBySelector(filter: any, namespace: string, pods = this.storePods){
        // An empty/absent selector (e.g. a workload using matchExpressions only)
        // must NOT match every pod in the namespace.
        if (!filter || Object.keys(filter).length === 0) {
            return [];
        }
        return pods
            .filter((item: Pod) => item.data.metadata.namespace === namespace)
            .filter((item: Pod) => {
                let labels = item.data.metadata.labels;

                if (typeof labels === 'undefined') {
                    return false;
                } else {
                    for (let prop in filter) {
                        if (!labels.hasOwnProperty(prop)) {
                            return false;
                        }
                        if (labels[prop] !== filter[prop]) {
                            return false;
                        }
                    }
                }
                item.used = true;
                return true;
            });
    }
}
