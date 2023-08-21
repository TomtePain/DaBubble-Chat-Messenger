import { ArrayDataSource } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component } from '@angular/core';

const TREE_DATA: ExampleFlatNode[] = [
  {
    name: 'Channels',
    expandable: true,
    level: 0,
  },
  {
    name: '#Entwicklerteam',
    expandable: false,
    level: 1,
  },
  {
    name: 'Channel hinzufügen',
    expandable: false,
    level: 1,
  },
  {
    name: 'Direktnachrichten',
    expandable: true,
    level: 0,
  },
  {
    name: 'USER1',
    expandable: false,
    level: 1,
  },
];

/** Flat node with expandable and level information */
interface ExampleFlatNode {
  expandable: boolean;
  name: string;
  level: number;
  isExpanded?: boolean;
}


@Component({
  selector: 'app-workspace',
  templateUrl: './workspce.component.html',
  styleUrls: ['./workspce.component.scss']
})

export class WorkspceComponent {



 
  treeControl = new FlatTreeControl<ExampleFlatNode>(
    node => node.level,
    node => node.expandable,
  );

  dataSource = new ArrayDataSource(TREE_DATA);

  hasChild = (_: number, node: ExampleFlatNode) => node.expandable;

  getParentNode(node: ExampleFlatNode) {
    const nodeIndex = TREE_DATA.indexOf(node);

    for (let i = nodeIndex - 1; i >= 0; i--) {
      if (TREE_DATA[i].level === node.level - 1) {
        return TREE_DATA[i];
      }
    }

    return null;
  }

  shouldRender(node: ExampleFlatNode) {
    let parent = this.getParentNode(node);
    while (parent) {
      if (!parent.isExpanded) {
        return false;
      }
      parent = this.getParentNode(parent);
    }
    return true;
  }



}