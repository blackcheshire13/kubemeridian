import React, {PureComponent} from "react";
import {Pod} from "../models/Pod";
import {config} from "@grafana/runtime";
import {Styles} from "../common/styles";
import {isLight} from "../common/utils";
import {cx} from "@emotion/css";
import {Icon, Tooltip} from "@grafana/ui";
import {PodLogsContext} from "./PodLogsContext";
import {POD_DASHBOARD_UID} from "../constants";

interface Props{
    pod: Pod;
    clusterName: string;
}

export class PodCard extends PureComponent<Props>{
    static contextType = PodLogsContext;
    declare context: React.ContextType<typeof PodLogsContext>;

    private pod;
    private orgId;
    styles;

    constructor(props: Props) {
        super(props);
        this.pod = props.pod;
        this.orgId = config.bootData.user.orgId;
        this.styles = Styles(isLight());
    }

    getPodDashboardLink(){
        // Pod dashboard keyed on namespace + pod; cluster defaults to All (its
        // $cluster is a Prometheus label, unrelated to this datasource's name).
        const ns = encodeURIComponent(this.pod.data.metadata.namespace);
        const pod = encodeURIComponent(this.pod.name);
        return `/d/${POD_DASHBOARD_UID}/pod?orgId=${this.orgId}&var-namespace=${ns}&var-pod=${pod}`;
    }

    render(){
        const podLogs = this.context;
        return(
            <div className={'pod'}>
                <span className={cx(this.styles.statusIndicator, this.pod.color)}/>

                <Tooltip content={this.pod.message} placement={'bottom'}>
                    <span className={'pod_title'}>{this.pod.name}</span>
                </Tooltip>
                &nbsp;
                {podLogs && (
                    <>
                        <a
                            role="button"
                            tabIndex={0}
                            style={{ cursor: 'pointer' }}
                            title="View logs"
                            onClick={() => podLogs.show(this.pod.data.metadata.namespace, this.pod.name)}
                        >
                            <Icon name="align-left" />
                        </a>
                        &nbsp;
                    </>
                )}
                <a href={this.getPodDashboardLink()} target={'_blank'} rel="noreferrer" title="Open pod dashboard">
                    <Icon name="eye" />
                </a>
            </div>
        )
    }
}
