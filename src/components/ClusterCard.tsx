import React, { PureComponent } from 'react';
import { K8sCluster } from '../types';
import { Button, Card, ConfirmModal, LinkButton } from '@grafana/ui';
import { PLUGIN_BASE_URL, ROUTES } from '../constants';

interface Props {
  cluster: K8sCluster;
  clusterDelete: (uid: string) => void;
}

interface State {
  showDeleteModal: boolean;
}

export class ClusterCard extends PureComponent<Props, State> {
  state: State = { showDeleteModal: false };

  private link = (route: ROUTES) => `${PLUGIN_BASE_URL}/${route}/${this.props.cluster.id}`;
  private editLink = () => `/connections/datasources/edit/${this.props.cluster.uid}`;

  showDeleteModal = () => this.setState({ showDeleteModal: true });
  hideDeleteModal = () => this.setState({ showDeleteModal: false });

  handleDelete = () => {
    this.props.clusterDelete(this.props.cluster.uid);
    this.hideDeleteModal();
  };

  render() {
    const { cluster } = this.props;
    return (
      <Card>
        <Card.Heading>{cluster.name}</Card.Heading>
        <Card.Actions>
          <LinkButton variant="primary" icon="eye" href={this.link(ROUTES.ClusterStatus)}>
            Cluster Status
          </LinkButton>
          <LinkButton variant="primary" icon="apps" href={this.link(ROUTES.ApplicationsOverview)}>
            Applications Overview
          </LinkButton>
          <LinkButton variant="primary" icon="cube" href={this.link(ROUTES.NodesOverview)}>
            Nodes Overview
          </LinkButton>
        </Card.Actions>
        <Card.SecondaryActions>
          <LinkButton variant="secondary" icon="cog" href={this.editLink()}>
            Edit
          </LinkButton>
          <Button variant="destructive" icon="trash-alt" onClick={this.showDeleteModal}>
            Delete
          </Button>
          <ConfirmModal
            isOpen={this.state.showDeleteModal}
            title="Delete cluster"
            body="Are you sure you want to delete this cluster?"
            confirmText="Delete"
            onConfirm={this.handleDelete}
            onDismiss={this.hideDeleteModal}
          />
        </Card.SecondaryActions>
      </Card>
    );
  }
}
